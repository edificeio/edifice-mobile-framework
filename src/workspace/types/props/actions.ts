import { IFiltersParameters } from "../filters";

export interface IActionProps {
  getList: (params: IFiltersParameters) => void
  upload: (fileUri: string) => void
}