import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Conf from "../../../ode-framework-conf";

// IMPORTANT: A file extension is always required on iOS.
const localFile = `${RNFS.DocumentDirectoryPath}/`;


export function openFile(fileName: string, id: string) {
  const options = {
    fromUrl: encodeURI(`${Conf.currentPlatform.url}/workspace/document/${id}`),
    toFile: encodeURI(`${localFile}${fileName}`)
  };

  RNFS.downloadFile(options).promise
      .then(() => FileViewer.open(options.toFile))
      .then(() => {
        // success
      })
      .catch(error => {
        console.log(error)
      });
}


