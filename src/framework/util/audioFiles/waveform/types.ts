import { PlayerState, RecorderState } from '@simform_solutions/react-native-audio-waveform';

export interface CustomWaveformProps {
  audioTotalDuration?: number;
  amplitude?: number;
  barColor?: string;
  barSpace?: number;
  barWidth?: number;
  maxBars?: number;
  playerState?: PlayerState;
  recorderState?: RecorderState;
  recordedBars?: number[]; // Bars captured during recording to be passed to the player
  resetPlayer?: () => void;
  setRecordedBars?: (bars: number[]) => void;
  speed?: number; // ms between each bar
}
