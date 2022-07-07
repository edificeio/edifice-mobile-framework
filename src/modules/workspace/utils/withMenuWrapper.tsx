import * as React from 'react';
import { StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import FlatList from '~/framework/components/flatList';
import { FakeHeader_Container, FakeHeader_Row, HeaderBackAction, HeaderTitle } from '~/framework/components/header';
import { Icon } from '~/framework/components/picture';
import { ITreeItem } from '~/modules/workspace/actions/helpers/formatListFolders';
import { listFoldersAction } from '~/modules/workspace/actions/listFolders';
import { IItem } from '~/modules/workspace/types';
import { EVENT_TYPE, IEvent } from '~/types/ievents';
import { ConfirmDialog } from '~/ui/ConfirmDialog';
import { FloatingAction } from '~/ui/FloatingButton/FloatingAction';
import ProgressBar from '~/ui/ProgressBar';
import { IMenuItem, initialMenuItem } from '~/ui/types';

const styles = StyleSheet.create({
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    padding: 14,
  },
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: 8,
  },
  titleText: {
    justifyContent: 'center',
    width: '70%',
    left: '15%',
  },
});
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

function nbItems(items) {
  if (!items) return 0;
  return Object.keys(items).length;
}

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
        case EVENT_TYPE.MENU_SELECT: {
          const selectedMenuItem = item as any as IMenuItem;
          const filter = navigation.getParam('filter');

          // check to see if dialog
          if (selectedMenuItem.dialog) {
            if (selectedMenuItem.dialog.selectDestination)
              this.props.dispatch(listFoldersAction()).then(() => this.setState({ dialogVisible: true, selectedMenuItem }));
            // we refresh folders before calling confirm dialog
            else this.setState({ dialogVisible: true, selectedMenuItem });
          } else {
            selectedMenuItem.onEvent({
              dispatch,
              filter,
              navigation,
              parentId: navigation.getParam('parentId'),
              selected: selectedItems,
            });
          }
        }
      }
    }

    renderAction = ({ item }: any) => {
      const selectedArrayItems = Object.values(this.props.selectedItems);
      const { icon, options = {} } = item;
      const isFolder = (selectedArrayItems && selectedArrayItems.filter(i => i.isFolder)) || [];
      const isDisabled =
        (options.monoselection && selectedArrayItems && selectedArrayItems.length !== 1) || (isFolder.length && options.onlyFiles);

      return (
        <TouchableOpacity
          style={styles.actionContainer}
          onPress={() => this.handleEvent({ type: EVENT_TYPE.MENU_SELECT, id: item.id, item })}
          disabled={isDisabled}>
          <Icon color={isDisabled ? '#77777750' : '#ffffff'} size={24} name={icon} />
        </TouchableOpacity>
      );
    };

    render() {
      const { dispatch, cut, folders, navigation, nbSelectedItems, selectedItems, ...rest } = this.props;
      const parentId = navigation.getParam('parentId');
      const popupMenuItems = this.getMenuItems('popupItems');
      const toolbarActions = this.getMenuItems('toolbarActions');
      const filter = navigation.getParam('filter');
      const title = navigation.getParam('title');
      const { dialogVisible, selectedMenuItem } = this.state;
      const selectedArrayItems = Object.values(selectedItems);
      const headerColor =
        selectedArrayItems && selectedArrayItems.length ? theme.palette.secondary.regular : theme.palette.primary.regular;

      const onGoBack = () => {
        if (this.props.nbSelectedItems) {
          this.props.dispatch(selectClearAction());
        } else {
          this.props.navigation.pop();
        }
      };

      return (
        <View style={styles.mainContainer}>
          <StatusBar barStyle="light-content" backgroundColor={headerColor} />
          <FakeHeader_Container style={{ backgroundColor: headerColor }}>
            <FakeHeader_Row>
              <HeaderBackAction onPress={onGoBack} />
              {selectedArrayItems && selectedArrayItems.length ? (
                <>
                  <HeaderTitle>{selectedArrayItems.length}</HeaderTitle>
                  <FlatList
                    contentContainerStyle={styles.headerContainer}
                    data={toolbarActions}
                    scrollEnabled={false}
                    keyExtractor={(item: IMenuItem) => item.id}
                    renderItem={this.renderAction}
                  />
                </>
              ) : (
                <HeaderTitle style={styles.titleText}>{title}</HeaderTitle>
              )}
            </FakeHeader_Row>
          </FakeHeader_Container>
          <ProgressBar />
          {dialogVisible && (
            <ConfirmDialog
              {...selectedMenuItem.dialog}
              folders={folders}
              filter={filter}
              parentId={parentId}
              selected={selectedArrayItems}
              visible={this.state.dialogVisible}
              onValid={(param: IEvent) => {
                this.setState({ dialogVisible: false });
                requestAnimationFrame(() =>
                  selectedMenuItem.onEvent({
                    dispatch,
                    filter,
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
          {parentId !== 'shared' && !selectedArrayItems.length && popupMenuItems.length ? (
            <FloatingAction
              menuItems={popupMenuItems}
              onEvent={this.handleEvent.bind(this)}
              eventHandleData={{
                dispatch,
                filter,
                navigation,
                parentId: navigation.getParam('parentId'),
                filter: navigation.getParam('filter'),
                selected: selectedItems,
              }}
            />
          ) : null}
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
