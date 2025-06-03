import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { IWaveformRef, RecorderState } from '@simform_solutions/react-native-audio-waveform';
import Svg, { Rect } from 'react-native-svg';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { BodyText } from '~/framework/components/text';

interface CustomWaveformProps {
  height: number;
  barWidth?: number;
  barSpace?: number;
  barColor?: string;
  dotColor?: string;
  speed?: number; // ms between each bar
  maxBars?: number;
  amplitude: number;
  recorderState?: RecorderState;
  timerValue?: string;
  onPauseRecord?: () => Promise<boolean>;
  onResumeRecord?: () => Promise<boolean>;
  onStartRecord?: () => Promise<boolean>;
  onStopRecord?: () => Promise<boolean>;
}

function interpolate(value: number, minIn: number, maxIn: number, minOut: number, maxOut: number): number {
  if (value <= minIn) return minOut;
  if (value >= maxIn) return maxOut;
  return ((value - minIn) / (maxIn - minIn)) * (maxOut - minOut) + minOut;
}

const CustomWaveform = forwardRef<IWaveformRef, CustomWaveformProps>(
  (
    {
      amplitude,
      barColor = theme.palette.primary.regular,
      barSpace = 3,
      barWidth = 2,
      // dotColor = theme.palette.primary.regular,
      height,
      maxBars = 50,
      recorderState,
      speed = 50,
      timerValue,
    },
    ref,
  ) => {
    const [bars, setBars] = useState<number[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const oldAmp = useRef(amplitude);
    if (oldAmp.current !== amplitude) {
      console.info('AMP changed:', amplitude);
    }
    oldAmp.current = amplitude;

    useEffect(() => {
      if (recorderState === RecorderState.recording) {
        intervalRef.current = setInterval(() => {
          if (typeof amplitude === 'number' && !isNaN(amplitude) && isFinite(amplitude)) {
            setBars(prev => {
              const minAmpIn = 0.05; // seuil pour le point
              const maxAmpIn = 0.095;
              const minAmpOut = 0;
              const maxAmpOut = 1;
              const randomness = 0.2;

              let normalizedAmp = interpolate(amplitude, minAmpIn, maxAmpIn, minAmpOut, maxAmpOut);
              normalizedAmp *= Math.random() * randomness + 1 - randomness / 2; // ajoute un peu de variation aléatoire
              normalizedAmp = Math.pow((1 - Math.cos(normalizedAmp * Math.PI)) / 2, 2.5);

              const minBarHeight = 2;
              const barHeight = Math.max(minBarHeight, normalizedAmp * height);
              return [barHeight, ...prev].slice(0, maxBars);
            });
          }
        }, speed);
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [speed, maxBars, amplitude, recorderState, height]);

    return (
      <View
        style={{
          alignItems: 'center',
          backgroundColor: 'white',
          borderRadius: 8,
          flexDirection: 'row',
          height,
          overflow: 'hidden',
          width: getScaleWidth(327),
        }}>
        <Svg width={getScaleWidth(327) - UI_SIZES.dimensions.width.largePlus} height={height}>
          {bars
            .filter(amp => typeof amp === 'number' && !isNaN(amp) && isFinite(amp))
            .map((bar, i) => {
              const x = getScaleWidth(327) - (i + 1) * (barWidth + barSpace);
              return (
                <Rect
                  key={i}
                  x={x}
                  y={(height - bar) / 2}
                  width={barWidth}
                  height={bar}
                  rx={barWidth / 2}
                  fill={barColor}
                  opacity={0.8}
                />
              );
            })}
        </Svg>
        <View style={{ alignItems: 'flex-end', height, justifyContent: 'center', width: UI_SIZES.dimensions.width.largePlus }}>
          <BodyText>{timerValue ?? '00:00'}</BodyText>
        </View>
      </View>
    );
  },
);

export default CustomWaveform;
