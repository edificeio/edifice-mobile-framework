import { IFiltersParameters } from "../filters";

export interface IActionProps {
  listAction: (params: IFiltersParameters) => void
  uploadAction: (fileUri: string) => void
}
