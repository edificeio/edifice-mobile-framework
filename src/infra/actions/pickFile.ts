import DocumentPicker, { DocumentPickerResponse } from "react-native-document-picker";

export const pickFile = async (): Promise<DocumentPickerResponse | null> => {
  try {
    return DocumentPicker.pick({ type: [DocumentPicker.types.allFiles] });
  } catch (err) {
    console.log(err);
    return null;
  }
};
