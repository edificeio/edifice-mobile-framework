import { createStackNavigator } from "react-navigation-stack";
import ContainerItems from "./containers/Items";
import Details from "./containers/Details";
import {
  addMenu,
  backMenu,
  copyMenu,
  createMenu,
  deleteMenu,
  downloadMenu,
  emptyMenu,
  moveMenu,
  nbSelectedMenu,
  renameMenu,
  separatorMenu,
  titleMenu,
} from "./utils/menus";
import { Animated, Easing } from "react-native";

export default createStackNavigator(
  {
    Workspace: {
      screen: ContainerItems,
      params: {
        popupItems: [
          {
            filter: "owner",
            items: [addMenu(), createMenu()],
          },
        ],
        toolbarItems: [
          {
            filter: "root",
            items: [backMenu(), titleMenu(), emptyMenu()],
          },
        ],
        toolbarSelectedItems: [
          {
            filter: "root",
            items: [backMenu(), nbSelectedMenu(), separatorMenu(), copyMenu(), downloadMenu()],
          },
          {
            filter: "owner",
            items: [
              backMenu(),
              nbSelectedMenu(),
              separatorMenu(),
              renameMenu(),
              deleteMenu(),
              copyMenu(),
              moveMenu(),
              downloadMenu(),
            ],
          },
        ],
      },
    },
    WorkspaceDetails: {
      screen: Details,
      params: {
        toolbarItems: [
          {
            filter: "root",
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
    transitionConfig: () => ({
      transitionSpec: {
        duration: 0,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing,
      },
      screenInterpolator: sceneProps => {
        const { position, scene } = sceneProps;
        const { index } = scene;

        const opacity = position.interpolate({
          inputRange: [index - 1, index - 0.99, index],
          outputRange: [0, 1, 1],
        });

        return { transform: [] };
      },
    }),
  }
);
