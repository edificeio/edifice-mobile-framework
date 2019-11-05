import Conf from "../../ode-framework-conf";
import { nainNavNavigate } from "../navigation/helpers/navHelper";
import { NotificationHandlerFactory } from "../infra/pushNotification";
import {FilterId, IFile} from "./types";

const notifHandlerFactory :NotificationHandlerFactory<any,any,any> = dispatch => async notificationData => {

  if (!notificationData.resourceUri.startsWith("/workspace")) {
    return false;
  }
  const split = notificationData.resourceUri.split("/");
  const parentId = split[split.length - 1];

  if (!Conf.currentPlatform) throw new Error("must specify a platform");

  const name = (notificationData as any).resourceName
  const isFolder = notificationData.resourceUri.indexOf( '/folder/') > 0
  const filter = (notificationData as any).doc === "share"
    ? FilterId.shared
    : (notificationData as any).doc

  if (isFolder)
    nainNavNavigate("Workspace", { filter, parentId, title: name })
  else {
    const item: IFile = {
      date: Date.now(),
      id: parentId,
      isFolder: false,
      name,
      filename: name,
      owner: "",
      ownerName: "",
      size: 0,
      url: `/workspace/document/${parentId}`
    };
    nainNavNavigate("WorkspaceDetails", {item, title: name})
  }

  return true;
};

export default notifHandlerFactory;
