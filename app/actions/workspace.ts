import ImagePicker from 'react-native-image-picker';
import { Conf } from "../Conf";

console.log(ImagePicker);

export const takePhoto = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        console.log('launch camera')
        ImagePicker.launchCamera({
            quality: 0.7
        }, (response) => {
            console.log(response)
            resolve(response.uri);
        });
    });
};

export const uploadImage = async (uri: string) => {
    const uriParts = uri.split('.');
    const fileType = uri[uri.length - 1];
    let formData = new FormData();
    console.log(uri)
    formData.append('photo', {
        uri :uri,
        type: 'image/jpeg', // or photo.type
        name: 'testPhotoName'
      } as any);
    const response = await fetch(`${Conf.platform}/workspace/document?protected=true&application=media-library`, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
        },
    });
    const file = await response.json();
    return `${Conf.platform}/workspace/document/${file._id}`;
}