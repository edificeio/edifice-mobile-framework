import { LocalFile } from '../../fileHandler';

export interface AudioRecorderProps {
  onSave?: (file: LocalFile[]) => void;
  onCancel?: () => void;
  onError?: () => unknown;
}
