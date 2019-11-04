import Share from "react-native-share";
import {startDownload} from "./downloadHelper";
import {IFile} from "../../workspace/types/states";
import Mime from "mime";
import {Platform} from "react-native";

export const share = async (downloadable: IFile) => {
  const res = await startDownload( downloadable)
  const path = res.path()
  const mime = downloadable.contentType

  await Share.open({
    type: mime || 'text/html',
    url: Platform.OS === 'android' ? 'file://' + path : path,
    showAppsToView: true
  })
};