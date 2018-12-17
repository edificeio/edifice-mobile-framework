import ImagePicker from "react-native-image-picker";
import { Conf } from "../../Conf";
import Tracking from "../../tracking/TrackingManager";
import { signedFetch } from "../fetchWithCache";

// console.log(ImagePicker);

export const takePhoto = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log("launch camera");
    ImagePicker.launchCamera(
      {
        quality: 0.7,
        allowsEditing: true
      },
      response => {
        resolve(response.uri);
      }
    );
  });
};

export const uploadImage = async (uri: string) => {
  let formData = new FormData();
  console.log(uri);
  formData.append("photo", {
    uri: uri,
    type: "image/jpeg", // or photo.type
    name: "mobile-photo"
  } as any);
  const response = await signedFetch(
    `
        ${
          Conf.platform
        }/workspace/document?protected=true&application=media-library?thumbnail=120x120&thumbnail=100x100&thumbnail=290x290&thumbnail=381x381&thumbnail=1600x0
    `,
    {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data"
      }
    }
  );
  const file = await response.json();
  Tracking.logEvent("sentFile", {
    type: "image/jpeg"
  });
  return `/workspace/document/${file._id}`;
};
