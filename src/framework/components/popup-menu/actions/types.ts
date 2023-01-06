import { DocumentPickerOptions } from 'react-native-document-picker';
import { PlatformTypes } from 'react-native-document-picker/lib/typescript/fileTypes';
import { CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';

import { DocumentPicked, ImagePicked } from '../types';

export interface PopupActionProps {
  title?: string;
  action: () => void;
}

export interface PopupPickerActionProps {
  callback: (document: ImagePicked | DocumentPicked, sourceType?: string) => Promise<void> | void;
  options?: Partial<ImageLibraryOptions & CameraOptions & DocumentPickerOptions<keyof PlatformTypes>>;
  synchrone?: boolean;
}
