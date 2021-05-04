import { Platform, ActionSheetIOS } from "react-native";
import DocumentPicker from "react-native-document-picker";
import { launchImageLibrary } from "react-native-image-picker";
import Permissions, { PERMISSIONS } from "react-native-permissions";
import getPath from '@flyerhq/react-native-android-uri-path'
import I18n from "i18n-js";
import { ContentUri } from "../../workspace/types";
import { notifierShowAction } from "../notifier/actions";

type Captions = {
  image: string;
  document: string;
  cancel: string;
  title: string;
};

type PhotoCaptions = {
  title: string;
  cancelButtonTitle: string;
  takePhotoButtonTitle: string;
  chooseFromLibraryButtonTitle: string;
  permissionDenied: any;
};

const captions: Captions = {
  image: "common-picker-image",
  document: "common-picker-document",
  cancel: "Cancel",
  title: "common-picker-title",
};

const photoCaptions: PhotoCaptions = {
  title: "common-photoPicker-title",
  cancelButtonTitle: "Cancel",
  takePhotoButtonTitle: "common-photoPicker-take",
  chooseFromLibraryButtonTitle: "common-photoPicker-pick",
  permissionDenied: {
    title: "common-ErrorStorageAccessAlertTitle",
    text: "common-ErrorStorageAccessAlertText",
    reTryTitle: "common-ErrorStorageAccessAlertRetry",
    okTitle: "common-ok"
  }
};

type FilePickerPromise = (resolve: (payload: ContentUri) => void, reject: (error: Error) => void) => void;

const pick = (onlyImages?: boolean) => {
  return new Promise(onlyImages ? pickImage : (Platform.OS === "ios" ? pickIOS : pickDocument()));
};

const transformCaptions: (captions: any) => {} = captions => {
  let result = {};
  for (let caption of Object.keys(captions)) {
    if (typeof captions[caption] === "string") {
      result[caption] = I18n.t(captions[caption]);
    } else if (typeof captions[caption] === "object") {
      result[caption] = {};
      for (let subCaption of Object.keys(captions[caption])) {
        result[caption][subCaption] = I18n.t(captions[caption][subCaption]);
      }
    }
  }
  return result;
};

const pickIOS: FilePickerPromise = (resolve, reject) => {
  const { image, document, cancel, title } = transformCaptions(captions);
  const options = [image, document, cancel];
  const handlers = [pickImage, pickDocument(), () => pickClosed];
  const cancelButtonIndex = options.indexOf(cancel);

  ActionSheetIOS.showActionSheetWithOptions({ options, cancelButtonIndex, title }, buttonIndex => {
    handlers[buttonIndex](resolve, reject);
  });
};

const pickImage: FilePickerPromise = (resolve, reject) => {
  console.log(launchImageLibrary);
  launchImageLibrary({
    mediaType: 'photo'
  }, res => {
    if (res.didCancel) reject(new Error("Cancelled picking image"));
    else if (res.errorCode) reject(new Error("Error picking image"));
    else {
      const { uri, fileName, type } = res;
      if (!uri || !type) reject(new Error("Error picking image"));
      const realURI = Platform.select({ android: uri, ios: uri!.split("file://")[1] })!;
      resolve({ mime: type!, name: fileName || uri!.split("tmp/")[1], uri: realURI, path: realURI }); // WHat's the difference between uri and path ?
    }
  });
};

export const pickFileError = (notifierId: string) => {
  return (dispatch) => {
    dispatch(notifierShowAction({
      id: notifierId,
      text: I18n.t("common-ErrorStorageAccess"),
      icon: 'close',
      type: 'error'
    }));
  }
}

const pickDocumentAction = (onlyImages?: boolean) => async (resolve, reject) => {
  const result = await DocumentPicker.pick({
    type: [onlyImages ? DocumentPicker.types.images : DocumentPicker.types.allFiles],
  });
  const { uri, type, name } = result;
  const realURI = Platform.select({
    android: getPath(uri),
    ios: decodeURI(uri).split("file://")[1],
  });
  resolve({ mime: type, name: name, uri: realURI });
}

const pickDocument = (onlyImages?: boolean) => async (resolve, reject) => {
  try {
    const permissionStored = Platform.OS === "android" && await Permissions.check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    if (permissionStored === "denied") {
      const permissionRes = await Permissions.request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      if (permissionRes === "denied") {
        reject(new Error("Error picking document"));
      } else {
        pickDocumentAction(onlyImages)(resolve, reject);
      }
    } else {
      pickDocumentAction(onlyImages)(resolve, reject);
    }
  } catch(err) {
    if (err.message !== "User canceled document picker") {
      reject(new Error("Error picking document"));
    }
  }
};

const pickClosed = (_: any, reject: (error: Error) => void) => {
  reject(new Error("Cancelled picking document"));
};

export default pick;
