import { Conf } from "../../Conf";



export class DocFile{
    uri: string;
    base64: string;
    path: string;

    async openCamera(){
        /*const pickerResult = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 0.7
        });
        
        this.uri = pickerResult.uri;
        this.base64 = pickerResult.base64*/
    }

    async uploadImage(){
        const uriParts = this.uri.split('.');
        const fileType = this.uri[this.uri.length - 1];
      
        let formData = new FormData();
        formData.append('photo', {
          uri: this.uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      
        const response = await fetch(`${Conf.platform}/workspace/document?protected=true&application=media-library`, {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'multipart/form-data',
            } as any,
        });
        const file = await response.json();
        this.path = `${Conf.platform}/workspace/document/${file._id}`
    }
}

export class Workspace {
    static myDocuments;
    static appDocuments;
    static publicDocuments;
}