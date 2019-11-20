import MyFileReader from './FileReader';

export const fileToFormData = (file: File) => {

  return new Promise((resolve, reject) => {
    var reader = new MyFileReader();

    reader.onloadend = function() {
      var formData = new FormData();
      formData.append(
        "file",
        new Blob( [reader._result], { type: file.type }),
        file.name
      );
      resolve(formData);
    };

    if (!!file) {
      reader.readAsArrayBuffer(file);
    } else {
      reject("No file found");
    }
  })
};