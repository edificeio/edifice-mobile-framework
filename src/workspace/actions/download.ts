import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { asyncActionRawFactory } from "../../infra/actions/asyncActionFactory";
import { IFile, IItems } from "../types";
import { downloadFiles } from "../../infra/actions/downloadHelper";

export const actionTypesDownload = asyncActionTypes(config.createActionType("/workspace/download"));

export function downloadAction(parentId: string, selected: IItems<IFile>) {
  return asyncActionRawFactory(actionTypesDownload, { parentId }, async () => {
    downloadFiles(Object.values(selected));
    return {};
  });
}
