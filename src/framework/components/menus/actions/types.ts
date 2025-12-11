import { DocumentPickerResponse } from '@react-native-documents/picker';

import { Asset } from '~/framework/util/fileHandler/types';

export type ImagePicked = Required<Pick<Asset, 'uri' | 'type' | 'fileName' | 'fileSize' | 'base64' | 'width' | 'height'>>;

export type DocumentPicked = Required<Pick<DocumentPickerResponse, 'uri'>> & {
  fileName: string;
  fileSize: number;
  type: string | undefined;
};

export interface MenuAction {
  disabled?: boolean;
  title: string;
  action: () => void;
  icon?: {
    ios: string;
    android: string;
  };
  destructive?: boolean;
}

export interface MenuActionProps {
  disabled?: boolean;
  title?: string;
  action: () => void;
}

export interface MenuPickerActionProps {
  callback: (
    document: ImagePicked | DocumentPicked | (ImagePicked | DocumentPicked)[],
    sourceType?: string,
  ) => Promise<void> | void;
}
