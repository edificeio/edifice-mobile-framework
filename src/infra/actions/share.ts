import Share from "react-native-share";
import {startDownload, getExtension} from "./downloadHelper";
import {IFile} from "../../workspace/types/states";
import {Platform} from "react-native";
import { Trackers } from "../tracker";

export const share = async (downloadable: IFile) => {
  const res = await startDownload( downloadable, false, false)
  const path = res.path()
  const mime = downloadable.contentType

  await Share.open({
    type: mime || 'text/html',
    url: Platform.OS === 'android' ? 'file://' + path : path,
    showAppsToView: true
  })

  Trackers.trackEvent("Workspace", "SHARE TO", getExtension(downloadable.filename));
};
