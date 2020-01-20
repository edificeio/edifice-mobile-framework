import { IFiltersParameters } from "../filters";
import { ContentUri, IItem } from "..";

export interface IActionProps {
  listAction: (params: IFiltersParameters) => void;
  selectAction: (item: IItem) => void;
  uploadAction: (parentId: string, fileUri: ContentUri) => void;
}
