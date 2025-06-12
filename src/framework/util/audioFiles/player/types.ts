export interface AudioPlayerProps {
  filePath: string;
  recordedBars: number[];
  resetRecorder: () => void;
}
