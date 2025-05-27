import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import Svg, { Circle, Rect } from 'react-native-svg';

import theme from '~/app/theme';

interface CustomWaveformProps {
  width: number;
  height: number;
  barWidth?: number;
  barSpace?: number;
  barColor?: string;
  dotColor?: string;
  speed?: number; // ms between each bar
  maxBars?: number;
  getNextAmplitude: () => number; // callback to get the next amplitude (0-1)
  isRecording: boolean;
}

const CustomWaveform = forwardRef<View, CustomWaveformProps>(
  (
    {
      barColor = theme.palette.primary.regular,
      barSpace = 2,
      barWidth = 4,
      dotColor = theme.palette.primary.regular,
      getNextAmplitude,
      height,
      isRecording,
      maxBars = 50,
      speed = 100,
      width,
    },
    ref,
  ) => {
    const [bars, setBars] = useState<number[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      if (isRecording) {
        intervalRef.current = setInterval(() => {
          setBars(prev => {
            const next = [getNextAmplitude(), ...prev].slice(0, maxBars);
            return next;
          });
        }, speed);
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [isRecording, speed, maxBars, getNextAmplitude]);

    return (
      <View style={{ backgroundColor: 'white', borderRadius: 8, height, overflow: 'hidden', width }} ref={ref}>
        <Svg width={width} height={height}>
          {bars.map((amp, i) => {
            const x = width - (i + 1) * (barWidth + barSpace);
            const barHeight = Math.max(amp * height, 4);
            return (
              <Rect
                key={i}
                x={x}
                y={(height - barHeight) / 2}
                width={barWidth}
                height={barHeight}
                rx={barWidth / 2}
                fill={barColor}
                opacity={0.8}
              />
            );
          })}
          {/* Optionnel : un point animé à droite pour l'effet d'enregistrement */}
          <Circle cx={width - barWidth / 2} cy={height / 2} r={barWidth} fill={dotColor} opacity={isRecording ? 1 : 0.3} />
        </Svg>
      </View>
    );
  },
);

export default CustomWaveform;
