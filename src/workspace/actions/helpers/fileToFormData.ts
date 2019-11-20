import RNFB from 'rn-fetch-blob';
import MyFileReader from './FileReader';

export const fileToFormData = (file: File) => {

  return new Promise((resolve, reject) => {
    var reader = new MyFileReader();
    const Blob = RNFB.polyfill.Blob
    window.Blob = Blob

    reader.onloadend = function() {
      Blob.build([reader._result], {type: file.type})
        .then((blob: Blob) => {
          const formData = new FormData();

          formData.append(
            "file",
            blob,
            "image.png"
          );
          resolve(formData);
        })
    }

    if (!!file) {
      reader.readAsArrayBuffer(file);
    } else {
      reject("No file found");
    }
  })
};