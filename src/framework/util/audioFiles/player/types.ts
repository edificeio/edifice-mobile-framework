import { LocalFile } from '~/framework/util/fileHandler';

export interface AudioPlayerProps {
  audioFile: LocalFile;
  onSave?: (file: LocalFile[]) => void;
  onCancel?: () => void;
  onError?: () => unknown;
  recordedBarsForPlayer: number[];
  resetRecorder: () => void;
}
