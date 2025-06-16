import { LocalFile } from '~/framework/util/fileHandler';

export interface AudioRecorderProps {
  onSave?: (file: LocalFile[]) => void;
  onCancel?: () => void;
  onError?: () => unknown;
}
