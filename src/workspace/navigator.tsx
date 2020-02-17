import { Animated } from "react-native";
import { createStackNavigator } from "react-navigation-stack";
import ContainerItems from "./containers/Items";
import Details from "./containers/Details";
import {
  addMenu,
  backMenu,
  copyMenu,
  createMenu,
  deleteMenu,
  trashMenu,
  downloadMenu,
  emptyMenu,
  moveMenu,
  nbSelectedMenu,
  renameMenu,
  separatorMenu,
  titleMenu,
} from "./utils/menus";
import { FilterId } from "./types";

export default createStackNavigator(
  {
    Workspace: {
      screen: ContainerItems,
      params: {
        popupItems: [
          {
            filter: FilterId.owner,
            items: [addMenu(), createMenu()],
          },
        ],
        toolbarItems: [
          {
            filter: FilterId.root,
            items: [backMenu(), titleMenu(), emptyMenu()],
          },
        ],
        toolbarSelectedItems: [
          {
            filter: FilterId.root,
            items: [backMenu(), nbSelectedMenu(), separatorMenu(), copyMenu(), downloadMenu()],
          },
          {
            filter: FilterId.owner,
            items: [
              backMenu(),
              nbSelectedMenu(),
              separatorMenu(),
              renameMenu(),
              trashMenu(),
              copyMenu(),
              moveMenu(),
              downloadMenu(),
            ],
          },
          {
            filter: FilterId.trash,
            items: [backMenu(), nbSelectedMenu(), separatorMenu(), deleteMenu(), downloadMenu()],
          },
        ],
      },
    },
    WorkspaceDetails: {
      screen: Details,
      params: {
        toolbarItems: [
          {
            filter: FilterId.root,
            items: [backMenu(), titleMenu(), emptyMenu()],
          },
        ],
      },
    },
  },
  {
    initialRouteParams: {
      filter: "root",
      parentId: "root",
    },
    headerMode: "none",
  }
);
