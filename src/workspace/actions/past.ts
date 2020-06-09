import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { asyncActionFactory } from "../../infra/actions/asyncActionFactory";
import { formatResults } from "./helpers/documents";
import { IItem, IItems } from "../types";
import { IId } from "../../types";
import { Trackers } from "../../infra/tracker";

const WORKSPACE_PAST = "/workspace/documents/copy";

export const actionTypesPast = asyncActionTypes(config.createActionType(`${WORKSPACE_PAST}`));

/**
 * request format: {ids: ["dhdhdhh", "hhdhdhdh"]}
 * response format: [{"name":"test","application":"media-library","shared":[],"inheritedShares":[],"isShared":false,"ancestors":["622a693a-58c7-48a7-8206-a52da3ffddbb","a6ed2f36-a636-4e54-8b2a-b0f8f5039c52","a31195f7-d4ef-4101-bffb-8e642c641477"],"created":"2020-01-24 00:00.31.402","modified":"2020-01-24 00:00.31.402","owner":"91c22b66-ba1b-4fde-a3fe-95219cc18d4a","ownerName":"Isabelle Polonio","nameSearch":"test","eType":"folder","copyFromId":"726bc101-7214-45bf-adcf-fa983e9c0837","eParent":"a31195f7-d4ef-4101-bffb-8e642c641477","favorites":[],"_id":"70406ec8-5b2a-4c2a-ab4d-274c6408ef44"}]
 */
export function pastAction(destinationId: string, selected: IItems<IItem>) {
  const parentId = !destinationId || !destinationId.length ? "owner" : destinationId;
  const ids: string[] = Object.values(selected).reduce((acc: string[], item: IId) => [...acc, item.id], []);
  const root = parentId === "owner" ? "root" : parentId;

  Trackers.trackEvent("Workspace", "COPY", undefined, Object.keys(selected).length)

  return asyncActionFactory(
    `${WORKSPACE_PAST}/${root}`,
    { ids, parentId },
    actionTypesPast,
    (data: any) => formatResults(data, parentId),
    {
      method: "post",
    }
  );
}
