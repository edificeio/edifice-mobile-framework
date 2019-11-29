import {PermissionsAndroid, Platform} from "react-native";
import Mime from "mime";
import Permissions from "react-native-permissions";
import RNFetchBlob, {FetchBlobResponse} from "rn-fetch-blob";
import Conf from "../../../ode-framework-conf";
import {getAuthHeader} from "../oauth";
import {IFile} from "../../workspace/types";
import {platform} from "os";

export const startDownload = async (downloadable: IFile, withManager = true): Promise<FetchBlobResponse> => {
  let path = await getDirName() + '/' + downloadable.filename;

  const config = Platform.OS === "android"
  ? {
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: withManager,
        mediaScannable: true,
        path
      }
    }
  : {
      path,
      appendExt: getExtension(downloadable.filename)
    };

  return RNFetchBlob
    .config(config)
    .fetch("GET", Conf.currentPlatform.url + downloadable.url, getAuthHeader()["headers"])
};

export const openPreview = async (downloadable: IFile) => {
  const res = await downloadOnCache( downloadable)

  openDownloadedFile(res.path());
};

export const downloadOnCache = async (downloadable: IFile): Promise<FetchBlobResponse> => {
  return await RNFetchBlob
    .config({
      fileCache: true,
      appendExt: getExtension(downloadable.filename)
    })
    .fetch("GET", Conf.currentPlatform.url + downloadable.url, getAuthHeader()["headers"]);
};

export const openDownloadedFile = (filepath: string): void => {
  if (Platform.OS === "ios")
    RNFetchBlob.ios.openDocument(filepath);
  else if (Platform.OS === "android") {
    RNFetchBlob.android.actionViewIntent(filepath, Mime.getType(filepath) || 'text/html');
  }
  else
    console.warn("Cannot handle file for devices other than ios/android.");
};

export const getDirName = async () : Promise<string> => {
  if (Platform.OS === "android") {
    await Permissions.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    return RNFetchBlob.fs.dirs.DownloadDir;
  } else if (Platform.OS === "ios") {
    return RNFetchBlob.fs.dirs.DocumentDir;
  }
  console.warn("Cannot handle file for devices other than ios/android.");
  return "";
};

const getExtension = ( filename: string) : string => {
  return filename.substr(filename.lastIndexOf(".") + 1)
};
