import * as React from "react";
import { View } from "react-native";
import { connect } from "react-redux";
import { EVENT_TYPE, IEvent } from "../../types/ievents";
import { FilterId } from "../types/filters";
import { selectAction, selectClearAction } from "../actions/select";
import { IMenuItem } from "../../ui/types";
import { FloatingAction } from "../../ui/FloatingButton";
import { ToolbarAction } from "../../ui/Toolbar";
import { ConfigDialog } from "../../ui/ConfigDialog";
import { IFile } from "../types";
import { copyClearAction } from "../actions/copypast";

export interface IProps {
  dispatch: any;
  navigation: any;
  pastFileItems: Array<IFile>;
  SelectedDocumentItems: Array<IFile>;
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
      const { navigation, pastFileItems } = this.props;
      const popupItems = navigation.getParam(idMenu) || [];
      const filter = pastFileItems.length ? "past" : navigation ? navigation.getParam("filter") : "root";

      return popupItems.reduce(
        (acc: any, items: any) => (items.filter === filter || items.filter === "root" ? items.items : acc),
        []
      );
    }

    public handleEvent({ type, item }: IEvent) {
      const { dispatch, navigation, pastFileItems, SelectedDocumentItems } = this.props;

      switch (type) {
        case EVENT_TYPE.SELECT:
          if (!pastFileItems.length && SelectedDocumentItems.length) {
            dispatch(selectAction(item));
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
          if (!pastFileItems.length) dispatch(selectAction(item));
          return;

        case EVENT_TYPE.MENU_SELECT: {
          const selectedMenuItem = (item as any) as IMenuItem;

          if (selectedMenuItem.id === "back") {
            dispatch(selectClearAction());
            dispatch(copyClearAction());
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
              selected: pastFileItems.length ? pastFileItems : SelectedDocumentItems,
            });
          }
        }
      }
    }

    render() {
      const { dispatch, navigation, pastFileItems, SelectedDocumentItems, ...rest } = this.props;
      const menuItems = this.getMenuItems("popupItems");
      const toolbarItems = this.getMenuItems("toolbarItems");
      const { dialogVisible, selectedMenuItem } = this.state;
      let dialogParams = selectedMenuItem ? selectedMenuItem.dialog : {};

      return (
        <View style={{ flex: 1 }}>
          <WrappedComponent
            {...(rest as T)}
            dispatch={dispatch}
            navigation={navigation}
            onEvent={this.handleEvent.bind(this)}
          />
          <FloatingAction
            menuItems={menuItems}
            onEvent={this.handleEvent.bind(this)}
            nbSelected={SelectedDocumentItems.length}
          />
          <ToolbarAction
            menuItems={toolbarItems}
            onEvent={this.handleEvent.bind(this)}
            nbSelected={SelectedDocumentItems.length}
          />
          {dialogVisible && (
            <ConfigDialog
              {...dialogParams}
              selected={SelectedDocumentItems}
              visible={this.state.dialogVisible}
              onValid={(param: IEvent) => {
                this.setState({ dialogVisible: false });
                selectedMenuItem.onEvent({
                  dispatch,
                  navigation,
                  parentId: navigation.getParam("parentId"),
                  ...param,
                  selected: pastFileItems.length ? pastFileItems : SelectedDocumentItems,
                });
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
  return {
    SelectedDocumentItems: Object.values(state.workspace.selected),
    pastFileItems: state.workspace.copy,
  };
};

export default (wrappedComponent: React.ComponentType<any>): React.ComponentType<any> =>
  connect(mapStateToProps, null)(withMenuWrapper(wrappedComponent));
