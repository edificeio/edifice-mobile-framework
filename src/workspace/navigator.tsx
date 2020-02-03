import { createStackNavigator } from "react-navigation-stack";
import I18n from "i18n-js";
import * as React from "react";
import ContainerItems from "./containers/Items";
import { Details } from "./containers/Details";
import config from "./config";
import { HeaderAction, HeaderIcon } from "../ui/headers/NewHeader";
import { standardNavScreenOptions } from "../navigation/helpers/navScreenOptions";
import {
  addMenu,
  backMenu,
  copyMenu,
  createMenu,
  deleteMenu,
  downloadMenu,
  moveMenu,
  nbSelectedMenu,
  renameMenu,
  separatorMenu,
} from "./utils/menus";

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
    },
  },
  {
    initialRouteParams: {
      filter: "root",
      parentId: "root",
    },
    defaultNavigationOptions: ({ navigation }: { navigation: any }) =>
      standardNavScreenOptions(
        {
          title: navigation.getParam("title") || I18n.t(config.displayName),
          headerLeft: <HeaderAction onPress={() => navigation.pop()} name="back" />,
          headerRight: <HeaderIcon name={null} hidden />,
        },
        navigation
      ),
  }
);
