import { IFiltersParameters } from "../filters";

export interface IActionProps {
  fetchWorkspaceList: (params: IFiltersParameters) => void
}