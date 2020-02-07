import I18n from "i18n-js";
import { copyDocuments, moveDocuments } from "./copypast";
import { downloadAction } from "../actions/download";
import { createFolderAction } from "../actions/create";
import { deleteAction } from "../actions/delete";
import { pickFile } from "./pickFile";
import { renameAction } from "../actions/rename";

export const addMenu = () => {
  return {
    text: I18n.t("add-document"),
    icon: "file-plus",
    id: "addDocument",
    onEvent: ({ dispatch, parentId }: any) => pickFile({ dispatch, parentId }),
  };
};

export const backMenu = () => ({
  text: "Back",
  icon: "chevron-left1",
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
  onEvent: ({ dispatch, parentId, value }) => dispatch(createFolderAction(parentId, value)),
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
  options: { onlyFiles: true },
  dialog: {
    title: I18n.t("download-documents"),
    okLabel: I18n.t("download"),
  },
  onEvent: ({ dispatch, parentId, selected }) => dispatch(downloadAction(parentId, selected)),
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
