export interface AudioPlayerProps {
  filePath: string;
  recordedBarsForPlayer: number[];
  resetRecorder: () => void;
}
