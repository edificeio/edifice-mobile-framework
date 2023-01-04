import { DocumentPickerOptions, DocumentPickerResponse } from 'react-native-document-picker';
import { PlatformTypes } from 'react-native-document-picker/lib/typescript/fileTypes';
import { Asset, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';

export type ImagePicked = Required<Pick<Asset, 'uri' | 'type' | 'fileName' | 'fileSize' | 'base64' | 'width' | 'height'>>;
export type DocumentPicked = Required<Pick<DocumentPickerResponse, 'uri' | 'type'>> & {
  fileName: string;
  fileSize: number;
};

export interface PopupActionProps {
  title?: string;
  action: () => void;
}

export interface PopupPickerActionProps {
  callback: (document: ImagePicked | DocumentPicked, sourceType?: string) => Promise<void> | void;
  options?: Partial<ImageLibraryOptions & CameraOptions & DocumentPickerOptions<keyof PlatformTypes>>;
  multiple?: boolean;
  synchrone?: boolean;
}
