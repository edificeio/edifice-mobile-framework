import { Platform } from "react-native";
import RNFetchBlob from "rn-fetch-blob";
import Permissions from "react-native-permissions";
import Conf from "../../../ode-framework-conf";

import { getAuthHeader } from "../oauth";

import Mime from "mime";

export interface IDownloadable {
  url: string;
  filename: string;
  contentType: string;
  size: number; // in Bytes
}

export const startDownload = async (downloadable: IDownloadable) => {
  let path = "";
  if (Platform.OS === "android") {
    await Permissions.request("storage");
    path = RNFetchBlob.fs.dirs.DownloadDir;
  } else if (Platform.OS === "ios") {
    path = RNFetchBlob.fs.dirs.DocumentDir;
  }

  path += '/'+downloadable.filename;
  console.log("path", path)

  RNFetchBlob.config({
    path,
  })
    .fetch("GET", Conf.currentPlatform.url + downloadable.url, getAuthHeader()["headers"])
    .then(res => {
      openDownloadedFile(res.path());
    })
    .catch((errorMessage, statusCode) => {
      console.log("Error downloading", statusCode, errorMessage);
    });
};

export const openDownloadedFile = (filepath:string) => {
  if (filepath) {
    if (Platform.OS === "ios") {
      RNFetchBlob.ios.openDocument(filepath);
    } else if (Platform.OS === "android") {
      RNFetchBlob.android.actionViewIntent(filepath, Mime.getType(filepath));
    } else {
      // tslint:disable-next-line:no-console
      console.warn("Cannot handle file for devices other than ios/android.");
    }
  }
};

export const openPreview = async (downloadable: IDownloadable) => {
  let path = "";
  if (Platform.OS === "android") {
    await Permissions.request("storage");
    path = RNFetchBlob.fs.dirs.DownloadDir;
  } else if (Platform.OS === "ios") {
    path = RNFetchBlob.fs.dirs.DocumentDir;
  }
  const indexOfExt = downloadable.filename.lastIndexOf(".");

  if (indexOfExt) {
    const filename = downloadable.filename.substr(indexOfExt);

    path += `/${filename}`;
    console.log("path", path)

    await RNFetchBlob
        .config({path})
        .fetch("GET", Conf.currentPlatform.url + downloadable.url, getAuthHeader()["headers"])

    await openDownloadedFile(path);
  }
}
