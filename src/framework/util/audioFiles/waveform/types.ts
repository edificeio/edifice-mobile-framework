import { PlayerState, RecorderState } from '@simform_solutions/react-native-audio-waveform';

type WaveFormType = 'Recorder' | 'Player';

export interface CustomWaveformProps {
  audioTotalDuration?: number;
  amplitude?: number; // Decibels captured by the native module
  barColor?: string;
  barSpace?: number;
  barWidth?: number;
  maxBars?: number;
  mode: WaveFormType;
  playerState?: PlayerState;
  recordedBars?: number[]; // Bars captured during recording to be passed to the player
  recorderState?: RecorderState;
  resetPlayer?: () => void;
  setRecordedBars?: (bars: number[]) => void;
  speed?: number; // ms between each bar
}
