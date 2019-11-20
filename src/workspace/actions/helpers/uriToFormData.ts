//import RNFB from 'rn-fetch-blob';

// window.File = RNFB.polyfill.File

export const uriToFormData = (uri: string) => {

  return new Promise((resolve, reject) => {
 //   File.build('image2.png', RNFB.wrap(uri), {type: 'image/png'})
 //     .then((file: File) => {
        // add the file to form data, now we have 2 files in form data
        const formData = new FormData();
        formData.append('file', uri, 'image2.png')
        resolve(formData);
 //     })
  })
};
