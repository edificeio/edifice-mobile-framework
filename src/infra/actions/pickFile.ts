import { Platform, ActionSheetIOS } from "react-native";
import DocumentPicker from "react-native-document-picker";
import ImagePicker from "react-native-image-picker";
import { ContentUri } from "../../workspace/types";
import I18n from "i18n-js";

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
};

const captions: Captions = {
  image: "workspace-image",
  document: "workspace-document",
  cancel: "Cancel",
  title: "workspace-pick",
};

const photoCaptions: PhotoCaptions = {
  title: "workspace-photoPicker-title",
  cancelButtonTitle: "Cancel",
  takePhotoButtonTitle: "workspace-photoPicker-take",
  chooseFromLibraryButtonTitle: "workspace-photoPicker-pick",
};

type FilePickerPromise = (resolve: (payload: ContentUri) => void, reject: (error: Error) => void) => void;

const pick = (onlyImages?: boolean) => {
  return new Promise(Platform.OS === "ios" ? (onlyImages ? pickImage : pickIOS) : pickDocument(onlyImages));
};

const transformCaptions: (captions: any) => {} = captions => {
  let result = {};
  for (let caption of Object.keys(captions)) {
    result[caption] = I18n.t(captions[caption]);
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
  ImagePicker.showImagePicker(transformCaptions(photoCaptions), result => {
    if (result.didCancel) {
      reject(new Error("Cancelled picking image"));
    } else if (result.error) {
      reject(new Error("Error picking image"));
    } else {
      const { uri, fileName, type } = result;
      resolve({ mime: type, name: fileName || uri.split("tmp/")[1], uri: uri.split("file://")[1] });
    }
  });
};

const pickDocument = (onlyImages? : boolean) => async (resolve, reject) => {
  try {
    const result = await DocumentPicker.pick({
      type: [onlyImages ? DocumentPicker.types.images : DocumentPicker.types.allFiles],
    });

    const { uri, type, name } = result;
    const realURI = Platform.select({ android: uri, ios: decodeURI(uri).split("file://")[1] });

    resolve({ mime: type, name: name, uri: realURI });
  } catch {
    reject(new Error("Error picking document"));
  }
};

const pickClosed = (_: any, reject: (error: Error) => void) => {
  reject(new Error("Cancelled picking document"));
};

export default pick;
