import { IFiltersParameters } from "../filters";
import { ContentUri } from "..";

export interface IActionProps {
  listAction: (params: IFiltersParameters) => void
  uploadAction: (fileUri: ContentUri) => void
}
