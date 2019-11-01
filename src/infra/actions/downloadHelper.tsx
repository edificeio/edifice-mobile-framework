import {Platform} from "react-native";
import Mime from "mime";
import Permissions from "react-native-permissions";
import RNFetchBlob, {FetchBlobResponse} from "rn-fetch-blob";
import Conf from "../../../ode-framework-conf";
import {getAuthHeader} from "../oauth";
import {IFile} from "../../workspace/types";

export const startDownload = async (downloadable: IFile) => {
  let path = await getDirName() + '/' + downloadable.filename;

  const res: FetchBlobResponse = await RNFetchBlob
    .config({
      path
    })
    .fetch("GET", Conf.currentPlatform.url + downloadable.url, getAuthHeader()["headers"])

  openDownloadedFile(res.path())
};

export const openPreview = async (downloadable: IFile) => {
  const res: FetchBlobResponse = await RNFetchBlob
    .config({
      fileCache: true,
      appendExt: getExtension(downloadable.filename)
    })
    .fetch("GET", Conf.currentPlatform.url + downloadable.url, getAuthHeader()["headers"]);

  openDownloadedFile(res.path());
}

const openDownloadedFile = (filepath: string, ext = false): void => {
  if (Platform.OS === "ios")
    RNFetchBlob.ios.openDocument(filepath);
  else if (Platform.OS === "android") {
    RNFetchBlob.android.actionViewIntent(filepath, Mime.getType(filepath) || 'text/html');
  }
  else
    console.warn("Cannot handle file for devices other than ios/android.");
};

const getDirName = async () : Promise<string> => {
  if (Platform.OS === "android") {
    await Permissions.request("storage");
    return RNFetchBlob.fs.dirs.DownloadDir;
  } else if (Platform.OS === "ios") {
    return RNFetchBlob.fs.dirs.DocumentDir;
  }
  console.warn("Cannot handle file for devices other than ios/android.");
  return "";
}

const getExtension = ( filename: string) : string => {
  return filename.substr(filename.lastIndexOf(".") + 1)
}
