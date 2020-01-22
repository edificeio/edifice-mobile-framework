import { IFiltersParameters } from "../filters";
import { ContentUri, IItem } from "..";
import { IId } from "../../../types";

export interface IActionProps {
  deleteAction: (parentId: string, selected: Array<IId>) => void;
  listAction: (params: IFiltersParameters) => void;
  pastAction: (parentId: string, selected: Array<IId>) => void;
  renameAction: (name: string, item: IItem, parentId: string) => void;
  selectAction: (item: IItem) => void;
  uploadAction: (parentId: string, fileUri: ContentUri) => void;
}
