import { PlayerState, RecorderState } from '@simform_solutions/react-native-audio-waveform';

type WaveFormType = 'Recorder' | 'Player';

export interface CustomWaveformProps {
  amplitude?: number; // Decibels captured by the native module
  audioTotalDuration?: number;
  barColor?: string;
  barsRef?: React.MutableRefObject<number[]>;
  barSpace?: number;
  barWidth?: number;
  maxBars?: number;
  mode: WaveFormType;
  stopRecorder?: () => Promise<void>;
  playerState?: PlayerState;
  recordedBarsForPlayer?: number[]; // Bars captured during recording to be passed to the player
  recorderState?: RecorderState;
  resetPlayer?: () => void;
  setBarsRef?: (bars: number[]) => void;
  speed?: number; // ms between each bar
}
