import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';

import { IWaveformRef, RecorderState } from '@simform_solutions/react-native-audio-waveform';
import Svg, { Rect } from 'react-native-svg';

import { CustomWaveformProps } from './types';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { BodyText } from '~/framework/components/text';

const MIN_AMP_OUT = 0;
const MAX_AMP_OUT = 1;
const MIN_BAR_HEIGHT = 2;

// This function scales the values of the decibels captured by the mic
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
      height,
      maxBars = 50,
      recorderState,
      speed = 50,
    },
    ref,
  ) => {
    const [bars, setBars] = useState<number[]>([]);
    const [recordingTime, setRecordingTime] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const oldAmp = useRef(amplitude);
    if (oldAmp.current !== amplitude) {
      console.info('AMP changed:', amplitude);
    }
    oldAmp.current = amplitude;

    /**
     * minAmpIn / maxAmpIn  : min/max decibel value captured by the mic that we will use as 0(min) and 1(max) on the scale
     * randomness : adds a random variation to the barHeight to make the waveform look more dynamic, based on the value of the previous barHeight
     */
    const { maxAmpIn, minAmpIn, randomness } = React.useMemo(() => {
      if (Platform.OS === 'ios') {
        return { maxAmpIn: 0.39, minAmpIn: 0, randomness: 0.4 };
      } else {
        return { maxAmpIn: 0.095, minAmpIn: 0.05, randomness: 0.2 };
      }
    }, []);

    // This useEffect handles the waveform bars display and height calculation
    useEffect(() => {
      if (recorderState === RecorderState.recording) {
        intervalRef.current = setInterval(() => {
          if (typeof amplitude === 'number' && !isNaN(amplitude) && isFinite(amplitude)) {
            setBars(prev => {
              let normalizedAmp = interpolate(amplitude, minAmpIn, maxAmpIn, MIN_AMP_OUT, MAX_AMP_OUT);
              normalizedAmp *= Math.random() * randomness + 1 - randomness / 2;
              normalizedAmp = Math.pow((1 - Math.cos(normalizedAmp * Math.PI)) / 2, 2.5);

              const barHeight = Math.max(MIN_BAR_HEIGHT, normalizedAmp * height);
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
    }, [speed, maxBars, amplitude, recorderState, height, minAmpIn, maxAmpIn, randomness]);

    // This useEffect handles the recording time display
    React.useEffect(() => {
      let interval: NodeJS.Timeout | null = null;
      if (recorderState === RecorderState.recording) {
        interval = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else if (recorderState === RecorderState.stopped) {
        setRecordingTime(0);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [recorderState]);

    const timerValue = `${String(Math.floor(recordingTime / 60)).padStart(1, '0')}:${String(recordingTime % 60).padStart(2, '0')}`;

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
          <BodyText>{timerValue ?? '0:00'}</BodyText>
        </View>
      </View>
    );
  },
);

export default CustomWaveform;
