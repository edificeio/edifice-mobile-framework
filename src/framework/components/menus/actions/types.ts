import { DocumentPickerResponse } from 'react-native-document-picker';
import { Asset } from 'react-native-image-picker';

export type ImagePicked = Required<Pick<Asset, 'uri' | 'type' | 'fileName' | 'fileSize' | 'base64' | 'width' | 'height'>>;

export type DocumentPicked = Required<Pick<DocumentPickerResponse, 'uri' | 'type'>> & {
  fileName: string;
  fileSize: number;
};

export interface MenuAction {
  title: string;
  action: () => void;
  icon?: {
    ios: string;
    android: string;
  };
  destructive?: boolean;
}

export interface MenuActionProps {
  title?: string;
  action: () => void;
}

export interface MenuPickerActionProps {
  callback: (document: ImagePicked | DocumentPicked, sourceType?: string) => Promise<void> | void;
}
