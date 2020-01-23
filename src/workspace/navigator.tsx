import { createStackNavigator } from "react-navigation-stack";
import I18n from "i18n-js";
import * as React from "react";
import ContainerItems from "./containers/Items";
import { Details } from "./containers/Details";
import { ISelectedParams } from "../types/ievents";
import config from "./config";
import { HeaderAction, HeaderIcon } from "../ui/headers/NewHeader";
import { standardNavScreenOptions } from "../navigation/helpers/navScreenOptions";
import { downloadFiles } from "../infra/actions/downloadHelper";
import { pickFile } from "./utils/pickFile";
import { createFolderAction } from "./actions/create";
import { renameAction } from "./actions/rename";
import { copyDocuments, cutDocuments, pastDocuments } from "./utils/copypast";
import { deleteAction } from "./actions/delete";

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
                onEvent: ({ dispatch, parentId }: any) => pickFile({ dispatch, parentId }),
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
                onEvent: ({ dispatch, parentId, value }) => dispatch(createFolderAction(value, parentId)),
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
                onEvent: params => copyDocuments(params),
              },
              {
                text: "Download",
                icon: "download",
                id: "download",
                onEvent: ({ selected }: ISelectedParams) => downloadFiles(selected),
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
                monoselection: true,
                dialog: {
                  title: "Renommer:",
                  input: "name",
                  okLabel: "Modifier",
                },
                onEvent: ({ dispatch, parentId, selected, value }) => dispatch(renameAction(value, selected, parentId)),
              },
              {
                text: "Delete",
                icon: "delete",
                id: "delete",
                dialog: {
                  title: "Vous etes sur le point de supprimer:",
                  okLabel: "Supprimer",
                },
                onEvent: ({ dispatch, parentId, selected }) => dispatch(deleteAction(parentId, selected)),
              },
              {
                text: "Copier",
                icon: "content-copy",
                id: "copy",
                onEvent: params => copyDocuments(params),
              },
              {
                text: "Déplacer",
                icon: "package-up",
                id: "move",
                writeAccess: true,
                dialog: {
                  title: "Déplacer documents",
                },
                onEvent: params => cutDocuments(params),
              },
              {
                text: "Download",
                icon: "download",
                id: "download",
                dialog: {
                  title: "Téléchargement documents:",
                  okLabel: "Télécharger",
                },
                onEvent: ({ selected }: ISelectedParams) => downloadFiles(selected),
              },
            ],
            past: [
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
                text: "Créer dossier",
                icon: "added_files",
                id: "AddFolder",
                dialog: {
                  title: "Créer dossier:",
                  input: true,
                  okLabel: "Créer",
                },
                onEvent: ({ dispatch, parentId, value }) => dispatch(createFolderAction(value, parentId)),
              },
              {
                text: "Coller",
                icon: "content-copy",
                id: "past",
                dialog: {
                  title: "Coller",
                },
                onEvent: params => pastDocuments(params),
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
