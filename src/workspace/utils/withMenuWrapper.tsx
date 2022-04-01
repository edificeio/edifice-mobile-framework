import * as React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import { nbItems } from './index';

import { EVENT_TYPE, IEvent } from '~/types/ievents';
import ProgressBar from '~/ui/ProgressBar';
import { ConfirmDialog } from '~/ui/ConfirmDialog';
import { FloatingAction } from '~/ui/FloatingButton';
import { ToolbarAction } from '~/ui/Toolbar';
import { IMenuItem, initialMenuItem } from '~/ui/types';
import { newDownloadThenOpenAction } from '~/workspace/actions/download';
import { ITreeItem } from '~/workspace/actions/helpers/formatListFolders';
import { listFoldersAction } from '~/workspace/actions/listFolders';
import { selectAction, selectClearAction } from '~/workspace/actions/select';
import { IItems } from '~/workspace/reducers/select';
import { IFile, IItem } from '~/workspace/types';
import { FilterId } from '~/workspace/types/filters';
import { FakeHeader_Container, FakeHeader_Row } from '~/framework/components/header';

export interface IProps {
  dispatch: any;
  folders: ITreeItem[];
  listFoldersAction: Function;
  navigation: any;
  nbSelectedItems: number;
  selectedItems: IItems<IItem>;
  selectAction: Function;
  cut: boolean;
}

export type IState = {
  refresh: boolean;
  dialogVisible: boolean;
  selectedMenuItem: IMenuItem;
};

function withMenuWrapper<T extends IProps>(WrappedComponent: React.ComponentType<T>): React.ComponentType<T> {
  return class extends React.PureComponent<T, IState> {
    state = {
      refresh: false,
      dialogVisible: false,
      selectedMenuItem: initialMenuItem,
    };

    getMenuItems(idSectionMenu: string): IMenuItem[] {
      const { navigation } = this.props;
      const sectionMenuItems = navigation.getParam(idSectionMenu) || [];
      const filter = navigation ? navigation.getParam('filter') : 'root';

      return sectionMenuItems.reduce(
        (acc: any, items: any) => (items.filter === filter || items.filter === 'root' ? items.items : acc),
        [],
      );
    }

    public handleEvent({ type, item }: IEvent) {
      const { dispatch, navigation, nbSelectedItems, selectedItems } = this.props;

      switch (type) {
        case EVENT_TYPE.SELECT:
          if (nbSelectedItems) {
            // we are in select mode
            // add a new item on selection list
            dispatch(selectAction(item));
          } else {
            // navigate
            const { id: parentId, name: title, isFolder } = item;
            const filterId = this.props.navigation.getParam('filter');
            const filter = filterId === FilterId.root ? parentId : filterId;

            // check we navigate on a no selected item

            if (Object.values(selectedItems).filter(selectedItem => selectedItem.id === parentId).length === 1) return;

            if (isFolder) navigation.push('Workspace', { filter, parentId, title });
            else navigation.push('WorkspaceDetails', { item, title });
          }
          return;

        case EVENT_TYPE.PREVIEW:
          dispatch(newDownloadThenOpenAction('', { item: item as IFile }));
          return;

        case EVENT_TYPE.LONG_SELECT:
          const filterId = navigation.getParam('filter');
          if (filterId != 'root') dispatch(selectAction(item));
          return;

        case EVENT_TYPE.MENU_SELECT: {
          const selectedMenuItem = item as any as IMenuItem;
          const filterId = navigation.getParam('filter');

          if (selectedMenuItem.id === 'back') {
            if (nbSelectedItems) dispatch(selectClearAction());
            else navigation.pop();
            return;
          } // deselect items

          // check to see if dialog
          if (selectedMenuItem.dialog) {
            if (selectedMenuItem.dialog.selectDestination)
              this.props.dispatch(listFoldersAction()).then(() => this.setState({ dialogVisible: true, selectedMenuItem }));
            // we refresh folders before calling confirm dialog
            else this.setState({ dialogVisible: true, selectedMenuItem });
          } else {
            selectedMenuItem.onEvent({
              dispatch,
              filterId,
              navigation,
              parentId: navigation.getParam('parentId'),
              selected: selectedItems,
            });
          }
        }
      }
    }

    render() {
      const { dispatch, cut, folders, navigation, nbSelectedItems, selectedItems, ...rest } = this.props;
      const parentId = navigation.getParam('parentId');
      const popupMenuItems = this.getMenuItems('popupItems');
      const toolbarItems = this.getMenuItems(nbSelectedItems ? 'toolbarSelectedItems' : 'toolbarItems');
      const filterId = navigation.getParam('filter');
      const { dialogVisible, selectedMenuItem } = this.state;
      const selectedArrayItems = Object.values(selectedItems);

      return (
        <View style={{ flex: 1 }}>
          <FakeHeader_Container>
            <FakeHeader_Row>
              <ToolbarAction
                menuItems={toolbarItems}
                navigation={navigation}
                onEvent={this.handleEvent.bind(this)}
                selected={selectedArrayItems}
              />
            </FakeHeader_Row>
          </FakeHeader_Container>
          <ProgressBar />
          {dialogVisible && (
            <ConfirmDialog
              {...selectedMenuItem.dialog}
              folders={folders}
              filterId={filterId}
              parentId={parentId}
              selected={selectedArrayItems}
              visible={this.state.dialogVisible}
              onValid={(param: IEvent) => {
                this.setState({ dialogVisible: false });
                requestAnimationFrame(() =>
                  selectedMenuItem.onEvent({
                    dispatch,
                    filterId,
                    navigation,
                    parentId,
                    selected: selectedItems,
                    ...param,
                  }),
                );
              }}
              onCancel={() => this.setState({ dialogVisible: false })}
            />
          )}
          <WrappedComponent
            {...(rest as T)}
            selectedItems={selectedItems}
            dispatch={dispatch}
            navigation={navigation}
            onEvent={this.handleEvent.bind(this)}
          />
          <FloatingAction
            menuItems={popupMenuItems}
            onEvent={this.handleEvent.bind(this)}
            selected={selectedArrayItems}
            eventHandleData={{
              dispatch,
              filterId,
              navigation,
              parentId: navigation.getParam('parentId'),
              selected: selectedItems,
            }}
          />
        </View>
      );
    }
  };
}

const mapStateToProps = (state: any) => {
  return {
    folders: state.workspace.folders,
    nbSelectedItems: nbItems(state.workspace.selected),
    selectedItems: state.workspace.selected,
  };
};

export default (wrappedComponent: React.ComponentType<any>): React.ComponentType<any> =>
  connect(mapStateToProps, dispatch => ({ dispatch }))(withMenuWrapper(wrappedComponent));
