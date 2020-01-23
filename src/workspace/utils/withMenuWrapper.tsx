import * as React from "react";
import { View } from "react-native";
import { connect } from "react-redux";
import { EVENT_TYPE, IEvent } from "../../types/ievents";
import { FilterId } from "../types/filters";
import { selectAction, selectClearAction } from "../actions/select";
import { IMenuItem, initialMenuItem } from "../../ui/types";
import { FloatingAction } from "../../ui/FloatingButton";
import { ToolbarAction } from "../../ui/Toolbar";
import { ConfirmDialog } from "../../ui/ConfirmDialog";
import { IItem } from "../types";
import { copyClearAction } from "../actions/copypast";
import { IItems } from "../reducers/select";
import { nbItems } from "./index";

export interface IProps {
  dispatch: any;
  navigation: any;
  clipboardItems: IItems<IItem>;
  nbClipboardItems: number;
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
      const { navigation, nbClipboardItems } = this.props;
      const sectionMenuItems = navigation.getParam(idSectionMenu) || [];
      const filter = navigation ? navigation.getParam("filter") : "root";

      if (nbClipboardItems)
        return sectionMenuItems.reduce(
          (acc: any, items: any) => (items.filter === filter || items.filter === "root" ? items.past : acc),
          []
        );

      return sectionMenuItems.reduce(
        (acc: any, items: any) => (items.filter === filter || items.filter === "root" ? items.items : acc),
        []
      );
    }

    public handleEvent({ type, item }: IEvent) {
      const {
        dispatch,
        navigation,
        clipboardItems,
        cut,
        nbClipboardItems,
        nbSelectedItems,
        selectedItems,
      } = this.props;

      switch (type) {
        case EVENT_TYPE.SELECT:
          if (!nbClipboardItems && nbSelectedItems) {
            // we are in select mode
            // add a new item on selection list
            dispatch(selectAction(item));
          } else {
            // navigate
            const { id: parentId, name: title, isFolder } = item;
            const filterId = this.props.navigation.getParam("filter");
            const filter = filterId === FilterId.root ? parentId : filterId;

            isFolder
              ? navigation.push("Workspace", { filter, parentId, title })
              : navigation.push("WorkspaceDetails", { item, title });
          }
          return;

        case EVENT_TYPE.LONG_SELECT:
          if (!nbClipboardItems) dispatch(selectAction(item));
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
              cut,
              dispatch,
              navigation,
              parentId: navigation.getParam("parentId"),
              selected: nbClipboardItems ? clipboardItems : selectedItems,
            });
          }
        }
      }
    }

    render() {
      const {
        dispatch,
        cut,
        navigation,
        clipboardItems,
        nbClipboardItems,
        nbSelectedItems,
        selectedItems,
        ...rest
      } = this.props;
      const parentId = navigation.getParam("parentId");
      const popupMenuItems = this.getMenuItems("popupItems");
      const toolbarItems = this.getMenuItems("toolbarItems");
      const { dialogVisible, selectedMenuItem } = this.state;
      const nbItems = nbClipboardItems || nbSelectedItems;

      return (
        <View style={{ flex: 1 }}>
          <WrappedComponent
            {...(rest as T)}
            selectedItems={selectedItems}
            dispatch={dispatch}
            navigation={navigation}
            onEvent={this.handleEvent.bind(this)}
          />
          <FloatingAction menuItems={popupMenuItems} onEvent={this.handleEvent.bind(this)} nbSelected={nbItems} />
          <ToolbarAction menuItems={toolbarItems} onEvent={this.handleEvent.bind(this)} nbSelected={nbItems} />
          {dialogVisible && (
            <ConfirmDialog
              {...selectedMenuItem.dialog}
              selected={Object.values(selectedMenuItem.id === "past" ? clipboardItems : selectedItems)}
              visible={this.state.dialogVisible}
              onValid={(param: IEvent) => {
                this.setState({ dialogVisible: false });
                selectedMenuItem.onEvent({
                  dispatch,
                  navigation,
                  parentId,
                  cut,
                  selected: nbClipboardItems ? clipboardItems : selectedItems,
                  ...param,
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
    clipboardItems: state.workspace.copy.selected,
    nbClipboardItems: nbItems(state.workspace.copy.selected),
    cut: state.workspace.copy.cut,
  };
};

export default (wrappedComponent: React.ComponentType<any>): React.ComponentType<any> =>
  connect(mapStateToProps, null)(withMenuWrapper(wrappedComponent));
