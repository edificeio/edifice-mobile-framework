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

const captions: Captions = {
  image: "workspace-image",
  document: "workspace-document",
  cancel: "Cancel",
  title: "workspace-pick",
};

type FilePickerPromise = (resolve: (payload: ContentUri) => void, reject: (error: Error) => void) => void;

const pick = () => {
  return new Promise(Platform.OS === "ios" ? pickIOS : pickDocument);
};

const pickIOS: FilePickerPromise = (resolve, reject) => {
  const transformCaptions: (captions: Captions) => Captions = (captions) => {
    let result = captions
    for(let caption of Object.keys(captions)) {
      result[caption] = I18n.t(captions[caption])
    }
    return result
  }

  const { image, document, cancel, title } = transformCaptions(captions);
  const options = [image, document, cancel];
  const handlers = [pickImage, pickDocument, () => pickClosed];
  const cancelButtonIndex = options.indexOf(cancel);

  ActionSheetIOS.showActionSheetWithOptions({ options, cancelButtonIndex, title }, buttonIndex => {
    handlers[buttonIndex](resolve, reject);
  });
};

const pickImage: FilePickerPromise = (resolve, reject) => {
  ImagePicker.showImagePicker(result => {
    if (result.didCancel) {
      reject(new Error("Action cancelled!"));
    } else {
      const { uri, fileName, type } = result;

      resolve({ mime: type, name: fileName || uri.split('tmp/')[1], uri: uri.split("file://")[1] });
    }
  });
};

const pickDocument: FilePickerPromise = async (resolve, reject) => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    });

    const { uri, type, name } = result;
    const realURI = Platform.select({ android: uri, ios: decodeURI(uri).split("file://")[1] });

    resolve({ mime: type, name: name, uri:realURI });
  } catch {
    reject(new Error("Action cancelled!"));
  }
};

const pickClosed = (_: any, reject: (error: Error) => void) => {
  reject(new Error("Action cancelled!"));
};

export default pick;
