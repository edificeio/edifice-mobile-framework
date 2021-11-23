import I18n from "i18n-js";
import { Platform } from "react-native";
import { copyDocuments, moveDocuments } from "./copypast";
import { downloadAndSaveAction } from "../actions/download";
// import { createFolderAction } from "../../framework/modules/workspace/actions/folder";
import { deleteAction, trashAction } from "../actions/delete";
import { renameAction } from "../actions/rename";
import { restoreAction } from "../actions/restore";
import { FilePicker } from "../../infra/filePicker";
import * as React from "react";
import { uploadAction } from "../actions/upload";
import { ContentUri } from "../types";
import { Trackers } from "../../framework/util/tracker";
import { createFolderAction } from "../actions/create";

export const addMenu = () => {
  return {
    text: I18n.t("add-file"),
    icon: "file-plus",
    id: "addDocument",
    // onEvent: ({ dispatch, parentId }: any) => pickFile({ dispatch, parentId }),
    wrapper: ({ children, dispatch, parentId }) => (
      <FilePicker multiple
        callback={async file => {
          const convertedFile: ContentUri = {
            mime: file.type,
            name: file.fileName,
            uri: file.uri,
            path: file.uri,
          };
          await dispatch(uploadAction(parentId, convertedFile));
        }}>
        {children}
      </FilePicker>
    ),
  };
};

export const backMenu = () => ({
  text: "Back",
  icon: Platform.OS === "ios" ? "chevron-left1" : "back",
  id: "back",
  onEvent: () => null,
});

export const createMenu = () => ({
  text: I18n.t("create-folder"),
  icon: "added_files",
  id: "AddFolder",
  dialog: {
    title: I18n.t("create-folder"),
    input: true,
    okLabel: I18n.t("create"),
  },
  onEvent: ({ dispatch, parentId, value }) => {
    Trackers.trackEvent("Workspace", "CREATE", "Folder");
    parentId === 'owner'
      ? dispatch(createFolderAction(value))
      : dispatch(createFolderAction(value, parentId));
  }
});

export const trashMenu = () => ({
  text: I18n.t("delete"),
  icon: "delete",
  id: "delete",
  dialog: {
    title: I18n.t("trash-confirm"),
    okLabel: I18n.t("delete"),
  },
  onEvent: ({ dispatch, parentId, selected }) => dispatch(trashAction(parentId, selected)),
});

export const deleteMenu = () => ({
  text: I18n.t("delete"),
  icon: "delete",
  id: "delete",
  dialog: {
    title: I18n.t("delete-confirm"),
    okLabel: I18n.t("delete"),
  },
  onEvent: ({ dispatch, parentId, selected }) => dispatch(deleteAction(parentId, selected)),
});

export const downloadMenu = () => ({
  text: I18n.t("download"),
  icon: "download",
  id: "download",
  options: { onlyFiles: true, monoselection: true },
  dialog: {
    title: I18n.t("download-documents"),
    okLabel: I18n.t("download"),
  },
  onEvent: ({ dispatch, parentId, selected }) => dispatch(downloadAndSaveAction(selected)),
});

export const restoreMenu = () => ({
  text: "restore",
  icon: "restore",
  id: "restore",
  onEvent: ({ dispatch, parentId, selected }) => dispatch(restoreAction(parentId, selected)),
});

export const copyMenu = () => ({
  text: I18n.t("copy"),
  icon: "content-copy",
  id: "copy",
  writeAccess: true,
  dialog: {
    title: I18n.t("copy-documents"),
    okLabel: I18n.t("copy"),
    selectDestination: true,
  },
  onEvent: params => copyDocuments(params),
});

export const moveMenu = () => ({
  text: I18n.t("move"),
  icon: "package-up",
  id: "move",
  writeAccess: true,
  dialog: {
    title: I18n.t("move-documents"),
    okLabel: I18n.t("move"),
    selectDestination: true,
  },
  onEvent: params => moveDocuments(params),
});

export const nbSelectedMenu = () => ({
  id: "nbSelected",
});

export const renameMenu = () => ({
  text: I18n.t("Edit"),
  icon: "pencil",
  id: "edit",
  options: { monoselection: true },
  dialog: {
    title: I18n.t("rename"),
    input: "name",
    okLabel: I18n.t("modify"),
  },
  onEvent: ({ dispatch, parentId, selected, value }) => dispatch(renameAction(parentId, selected, value)),
});

export const separatorMenu = () => ({
  id: "separator",
});

export const titleMenu = () => ({
  id: "title",
});

export const emptyMenu = () => ({
  id: "empty",
});
