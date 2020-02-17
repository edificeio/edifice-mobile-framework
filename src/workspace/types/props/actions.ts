import { IFiltersParameters } from "../filters";
import { IId } from "../../../types";
import { ContentUri, IItem } from "..";

export interface IActionProps {
  trashAction: (parentId: string, selected: IId[]) => void;
  deleteAction: (parentId: string, selected: IId[]) => void;
  listFoldersAction: () => void;
  listAction: (params: IFiltersParameters) => void;
  pastAction: (parentId: string, selected: IId[]) => void;
  renameAction: (name: string, item: IItem, parentId: string) => void;
  selectAction: (item: IItem) => void;
  uploadAction: (parentId: string, fileUri: ContentUri) => void;
}
