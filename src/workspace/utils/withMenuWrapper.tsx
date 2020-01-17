/**
 * Pour information: on a regroupé dans un meme wrapper withNavigationWrapper et withMenuWrapper
 * afin de pouvoir recupérer la bonne valeur de:
 * navigation.getParam({filter}) suite à un navigation.push('Workspace', { filter, parentId, title })
 * Le fait que navigation.push() soit fait dans un composant et navigation.getParam dans un autre composant posent problème
 */
import * as React from "react";
import { View } from "react-native";
import { EVENT_TYPE, IEvent } from "../../types/ievents";
import { FilterId } from "../types/filters";
import { selectAction } from "../actions/select";
import { connect } from "react-redux";
import { IMenuItem } from "../../ui/types";
import { FloatingAction } from "../../ui/FloatingButton";
import { ToolbarAction } from "../../ui/Toolbar";
import { ConfigDialog } from "../../ui/ConfigDialog";
import { IFile } from "../types";

export interface IProps {
  dispatch: any;
  navigation: any;
  selectedFileItems: Array<IFile>;
  selectAction: Function;
}

export type IState = {
  refresh: boolean;
  dialogVisible: boolean;
  selectedMenuItem: IMenuItem | null;
};

function withMenuWrapper<T extends IProps>(WrappedComponent: React.ComponentType<T>): React.ComponentType<T> {
  return class extends React.Component<T, IState> {
    state = {
      refresh: false,
      dialogVisible: false,
      selectedMenuItem: null,
    };

    getMenuItems(idMenu: string): IMenuItem[] {
      const { navigation } = this.props;
      const popupItems = navigation.getParam(idMenu) || [];
      const filter = navigation ? navigation.getParam("filter") : "root";

      return popupItems.reduce(
        (acc: any, items: any) => (items.filter === filter || items.filter === "root" ? items.items : acc),
        []
      );
    }

    public handleEvent({ type, item }: IEvent) {
      const { dispatch, navigation, selectAction, selectedFileItems } = this.props;

      switch (type) {
        case EVENT_TYPE.SELECT:
          if (selectedFileItems.length) {
            selectAction(item);
          } else {
            const { id: parentId, name: title, isFolder } = item;
            const filterId = this.props.navigation.getParam("filter");
            const filter = filterId === FilterId.root ? parentId : filterId;

            isFolder
              ? navigation.push("Workspace", { filter, parentId, title })
              : navigation.push("WorkspaceDetails", { item, title });
          }
          return;

        case EVENT_TYPE.LONG_SELECT:
          selectAction(item);
          return;

        case EVENT_TYPE.MENU_SELECT:
          const selectedMenuItem = (item as any) as IMenuItem;

          if (selectedMenuItem.id === "back") {
            selectAction(null);
            return;
          } // deselect items

          // check to see if dialog
          if (selectedMenuItem.dialog) {
            this.setState({ dialogVisible: true, selectedMenuItem });
          } else {
            selectedMenuItem.onEvent({
              dispatch,
              navigation,
              parentId: navigation.getParam("parentId"),
              selected: selectedFileItems,
            });
          }
          return;
      }
    }

    render() {
      const { dispatch, navigation, selectedFileItems, ...rest } = this.props;
      const menuItems = this.getMenuItems("popupItems");
      const toolbarItems = this.getMenuItems("toolbarItems");
      const { dialogVisible, selectedMenuItem } = this.state;
      let dialogParams = selectedMenuItem ? selectedMenuItem.dialog : {};

      return (
        <View style={{ flex: 1 }}>
          <WrappedComponent {...rest as T} navigation={navigation} onEvent={this.handleEvent.bind(this)} />
          <FloatingAction
            menuItems={menuItems}
            onEvent={this.handleEvent.bind(this)}
            nbSelected={selectedFileItems.length}
          />
          <ToolbarAction
            menuItems={toolbarItems}
            onEvent={this.handleEvent.bind(this)}
            nbSelected={selectedFileItems.length}
          />
          {dialogVisible && (
            <ConfigDialog
              {...dialogParams}
              selected={selectedFileItems}
              visible={this.state.dialogVisible}
              onValid={(param: IEvent) => {
                this.setState({ dialogVisible: false });
                selectedMenuItem.onEvent({ dispatch, navigation, parentId: navigation.getParam("parentId"), ...param });
              }}
              onCancel={() => this.setState({ dialogVisible: false })}
            />
          )}
        </View>
      );
    }
  };
}

const mapStateToProps = (state: any) => {
  return { selectedFileItems: Object.values(state.workspace.selected) };
};

export default (wrappedComponent: React.ComponentType<any>): React.ComponentType<any> =>
  connect(
    mapStateToProps,
    dispatch => ({ dispatch, selectAction })
  )(withMenuWrapper(wrappedComponent));
