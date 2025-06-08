import { RecorderState } from '@simform_solutions/react-native-audio-waveform';

export interface CustomWaveformProps {
  height: number;
  barWidth?: number;
  barSpace?: number;
  barColor?: string;
  speed?: number; // ms between each bar
  maxBars?: number;
  amplitude: number;
  recorderState?: RecorderState;
  onPauseRecord?: () => Promise<boolean>;
  onResumeRecord?: () => Promise<boolean>;
  onStartRecord?: () => Promise<boolean>;
  onStopRecord?: () => Promise<boolean>;
}
