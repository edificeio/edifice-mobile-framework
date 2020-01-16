import { createStackNavigator } from "react-navigation-stack";
import ContainerItems from "./containers/Items";
import { Details } from "./containers/Details";
import { ISelectedProps } from "../types/ievents";
import { Alert } from "react-native";
import { NavigationScreenProp } from "react-navigation";
import I18n from "i18n-js";
import config from "./config";
import { HeaderAction, HeaderIcon } from "../ui/headers/NewHeader";
import * as React from "react";
import { standardNavScreenOptions } from "../navigation/helpers/navScreenOptions";
import { downloadFile } from "../infra/actions/downloadHelper";
import { pickFile } from "./utils/pickFile";

export default createStackNavigator(
  {
    Workspace: {
      screen: ContainerItems,
      params: {
        popupItems: [
          {
            filter: "owner",
            items: [
              {
                text: "Ajouter Document",
                icon: "file-plus",
                id: "addDocument",
                onEvent: ({ dispatch }: any) => pickFile({ dispatch }),
              },
              {
                text: "Créer dossier",
                icon: "added_files",
                id: "AddFolder",
                dialog: {
                  title: "Créer dossier:",
                  input: true,
                  okLabel: "Créer",
                },
                onEvent: () => Alert.alert("Creer dossier"),
              },
            ],
          },
        ],
        toolbarItems: [
          {
            filter: "root",
            items: [
              {
                text: "Back",
                icon: "chevron-left1",
                id: "back",
                onEvent: () => null,
              },
              {
                id: "nbSelected",
              },
              {
                id: "separator",
              },
              {
                text: "Copier",
                icon: "content-copy",
                id: "copy",
                dialog: {
                  title: "Copier dans Documents personnel",
                },
                onEvent: ({ selected }: ISelectedProps) => Alert.alert("Elements selected" + JSON.stringify(selected)),
              },
              {
                text: "Download",
                icon: "download",
                id: "download",
                onEvent: ({ item }: ISelectedProps) => downloadFile(item),
              },
            ],
          },
          {
            filter: "owner",
            items: [
              {
                text: "Back",
                icon: "chevron-left1",
                id: "back",
                onEvent: () => null,
              },
              {
                id: "nbSelected",
              },
              {
                id: "separator",
              },
              {
                text: "Editer",
                icon: "pencil",
                id: "edit",
                monoselect: true,
                dialog: {
                  title: "Renommer:",
                  input: "filename",
                  okLabel: "Modifier",
                },
                onEvent: ({ selected }: ISelectedProps) => Alert.alert("Elements selected" + JSON.stringify(selected)),
              },
              {
                text: "Delete",
                icon: "delete",
                id: "delete",
                dialog: {
                  title: "Vous etes sur le point de supprimer:",
                  okLabel: "Supprimer",
                },
                onEvent: ({ selected }: ISelectedProps) => Alert.alert("Elements selected" + JSON.stringify(selected)),
              },
              {
                text: "Copier",
                icon: "content-copy",
                id: "copy",
                dialog: {
                  title: "Copier dans Documents personnel",
                  okLabel: "Copier",
                },
                onEvent: ({ selected }: ISelectedProps) => Alert.alert("Elements selected" + JSON.stringify(selected)),
              },
              /*               {
                  text: "Move",
                  icon: "package-up",
                  id: "move",
                  onEvent: ({ selected }: ISelectedProps) =>
                    Alert.alert("Elements selected" + JSON.stringify(selected)),
                },
 */ {
                text: "Download",
                icon: "download",
                id: "download",
                monoselection: true,
                dialog: {
                  title: "Téléchargement documents:",
                  okLabel: "Télécharger",
                },
                onEvent: ({ item }: ISelectedProps) => downloadFile(item),
              },
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
    defaultNavigationOptions: ({ navigation }: { navigation: NavigationScreenProp<{}> }) =>
      standardNavScreenOptions(
        {
          title: navigation.getParam("title") || I18n.t(config.displayName),
          headerLeft: <HeaderAction onPress={() => navigation.pop()} name={"back"} />,
          headerRight: <HeaderIcon name={null} hidden={true} />,
        },
        navigation
      ),
  }
);
