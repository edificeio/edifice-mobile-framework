import { DocumentPicked, ImagePicked } from '../types';

export interface PopupActionProps {
  title?: string;
  action: () => void;
}

export interface PopupPickerActionProps {
  callback: (document: ImagePicked | DocumentPicked, sourceType?: string) => Promise<void> | void;
}
