import { DocumentPickerResponse } from 'react-native-document-picker';
import { Asset } from 'react-native-image-picker';

export interface PopupMenuAction {
  title: string;
  action: () => void;
  icon: {
    ios: string;
    android: string;
  };
  destructive?: boolean;
}

export interface PopupMenuProps {
  actions: PopupMenuAction[];
  children: React.ReactNode;
}

export type ImagePicked = Required<Pick<Asset, 'uri' | 'type' | 'fileName' | 'fileSize' | 'base64' | 'width' | 'height'>>;

export type DocumentPicked = Required<Pick<DocumentPickerResponse, 'uri' | 'type'>> & {
  fileName: string;
  fileSize: number;
};
