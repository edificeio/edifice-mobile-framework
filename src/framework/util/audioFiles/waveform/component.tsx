import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';

import { IWaveformRef, PlayerState, RecorderState } from '@simform_solutions/react-native-audio-waveform';
import Svg, { Rect } from 'react-native-svg';

import styles, { WAVEFORM_HEIGHT } from './styles';
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
      audioTotalDuration,
      barColor = theme.palette.primary.regular,
      barSpace = 3,
      barWidth = 2,
      maxBars = 50,
      playerState,
      recordedBars = [],
      recorderState,
      resetPlayer,
      setRecordedBars,
      speed = 50,
    },
    ref,
  ) => {
    const [bars, setBars] = useState<number[]>([]);
    // states and refs for timers management :
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingStartTimeRef = useRef<number | null>(null);
    const accumulatedRecordingTimeRef = useRef(0);
    const [playerTime, setPlayerTime] = useState(0);
    const playerStartTimeRef = useRef<number | null>(null);
    const accumulatedPlayerTimeRef = useRef(0);

    const oldAmp = useRef(amplitude);
    if (oldAmp.current !== amplitude) {
      // console.info('AMP changed:', amplitude);
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

    const timerValue = React.useMemo(() => {
      if (recorderState === RecorderState.recording || recorderState === RecorderState.paused) {
        return `${Math.floor(recordingTime / 60)}:${String(Math.floor(recordingTime % 60)).padStart(2, '0')}`;
      }
      return `${Math.floor(playerTime / 60)}:${String(Math.floor(playerTime % 60)).padStart(2, '0')}`;
    }, [recorderState, recordingTime, playerTime]);

    // Convert audioDuration from ms to seconds and avoid division by zero
    const durationSec = audioTotalDuration ? audioTotalDuration / 1000 : 1;
    const progress = recordingTime / durationSec;
    // const barsToRender = recordedBars ? [...recordedBars].reverse() : [];
    const barsToRender = React.useMemo(() => {
      return recordedBars ? [...recordedBars].reverse() : [];
    }, [recordedBars]);
    const totalRecordedBars = barsToRender.length;
    const playedBars = Math.floor(progress * totalRecordedBars);

    // This useEffect handles the waveform bars display and height calculation for recording mode
    useEffect(() => {
      if (recorderState === RecorderState.recording) {
        intervalRef.current = setInterval(() => {
          if (typeof amplitude === 'number' && !isNaN(amplitude) && isFinite(amplitude)) {
            setBars(prev => {
              let normalizedAmp = interpolate(amplitude, minAmpIn, maxAmpIn, MIN_AMP_OUT, MAX_AMP_OUT);
              normalizedAmp *= Math.random() * randomness + 1 - randomness / 2;
              normalizedAmp = Math.pow((1 - Math.cos(normalizedAmp * Math.PI)) / 2, 2.5);

              const barHeight = Math.max(MIN_BAR_HEIGHT, normalizedAmp * WAVEFORM_HEIGHT);
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
    }, [speed, maxBars, amplitude, recorderState, minAmpIn, maxAmpIn, randomness]);

    // @todo : voir si je peux save une seule fois à la fin sur le clic sur stop
    // Saves the bars from recording to then display them in the player
    useEffect(() => {
      if (recorderState === RecorderState.recording && setRecordedBars) {
        setRecordedBars(bars);
      }
    }, [bars, recorderState, setRecordedBars]);

    // TIMER RECORDING MODE
    // This useEffect keeps precise track of the timer value for recording mode
    useEffect(() => {
      if (recorderState === RecorderState.recording) {
        recordingStartTimeRef.current = Date.now();
      } else if (recorderState === RecorderState.paused && recordingStartTimeRef.current) {
        accumulatedRecordingTimeRef.current += (Date.now() - recordingStartTimeRef.current) / 1000;
        recordingStartTimeRef.current = null;
      } else if (recorderState === RecorderState.stopped) {
        accumulatedRecordingTimeRef.current = 0;
        recordingStartTimeRef.current = null;
        setRecordingTime(0);
      }
    }, [recorderState]);

    // This useEffect updates the displayed timer value for recording mode
    useEffect(() => {
      let interval: NodeJS.Timeout | null = null;
      if (recorderState === RecorderState.recording && recordingStartTimeRef.current) {
        interval = setInterval(() => {
          setRecordingTime(accumulatedRecordingTimeRef.current + (Date.now() - (recordingStartTimeRef.current ?? 0)) / 1000);
        }, 200);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [recorderState]);

    // TIMER PLAYBACK MODE
    useEffect(() => {
      let interval: NodeJS.Timeout | null = null;
      if (playerState === PlayerState.playing) {
        playerStartTimeRef.current = Date.now();
        interval = setInterval(() => {
          const elapsed =
            accumulatedPlayerTimeRef.current + (playerStartTimeRef.current ? (Date.now() - playerStartTimeRef.current) / 1000 : 0);
          if (elapsed >= durationSec) {
            // Reset the timer when it reaches the total duration of the audio file
            setPlayerTime(0);
            accumulatedPlayerTimeRef.current = 0;
            playerStartTimeRef.current = null;
            if (interval) clearInterval(interval);
            if (resetPlayer) resetPlayer();
          } else {
            setPlayerTime(elapsed);
          }
        }, 200);
      } else if (playerState === PlayerState.paused && playerStartTimeRef.current) {
        accumulatedPlayerTimeRef.current += (Date.now() - playerStartTimeRef.current) / 1000;
        playerStartTimeRef.current = null;
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [playerState, durationSec, resetPlayer]);

    const renderWaveformBars = React.useCallback(() => {
      if (recorderState === RecorderState.recording || recorderState === RecorderState.paused) {
        return bars
          .filter(amp => typeof amp === 'number' && !isNaN(amp) && isFinite(amp))
          .map((bar, i) => {
            const x = getScaleWidth(327) - (i + 1) * (barWidth + barSpace);
            return (
              <Rect
                key={i}
                x={x}
                y={(WAVEFORM_HEIGHT - bar) / 2}
                width={barWidth}
                height={bar}
                rx={barWidth / 2}
                fill={barColor}
                opacity={0.8}
              />
            );
          });
      } else {
        // return barsToRender.map((bar, i) => {
        //   const x = getScaleWidth(327) - (i + 1) * (barWidth + barSpace);
        //   const isPlayed = i >= totalRecordedBars - playedBars;
        //   return (
        //     <Rect
        //       key={i}
        //       x={x}
        //       y={(WAVEFORM_HEIGHT - bar) / 2}
        //       width={barWidth}
        //       height={bar}
        //       rx={barWidth / 2}
        //       fill={isPlayed ? 'black' : barColor}
        //       opacity={0.8}
        //     />
        //   );
        // });
        // LECTURE : fenêtre glissante, gauche -> droite
        const maxStart = Math.max(0, totalRecordedBars - maxBars);
        const start = Math.min(Math.max(0, playedBars - maxBars + 1), maxStart);
        const end = Math.min(start + maxBars, totalRecordedBars);
        const visibleBars = barsToRender.slice(start, end);
        return visibleBars.map((bar, i) => {
          const barIndex = start + i;
          const isPlayed = barIndex < playedBars;
          const x = i * (barWidth + barSpace);
          return (
            <Rect
              key={barIndex}
              x={x}
              y={(WAVEFORM_HEIGHT - bar) / 2}
              width={barWidth}
              height={bar}
              rx={barWidth / 2}
              fill={isPlayed ? 'black' : barColor}
              opacity={0.8}
            />
          );
        });
      }
    }, [recorderState, bars, barWidth, barSpace, barColor, totalRecordedBars, maxBars, playedBars, barsToRender]);

    React.useEffect(() => {
      console.log('durationSec------', durationSec);
    }, [durationSec]);

    React.useEffect(() => {
      console.log('recooooordingTime-----', recordingTime);
    }, [recordingTime]);

    return (
      <View style={styles.waveformAndTimercontainer}>
        <View style={styles.waveform}>
          <Svg width={getScaleWidth(327) - UI_SIZES.dimensions.width.largePlus} height={WAVEFORM_HEIGHT}>
            {renderWaveformBars()}
          </Svg>
        </View>
        <View style={styles.timer}>
          <BodyText>{timerValue ?? '0:00'}</BodyText>
        </View>
      </View>
    );
  },
);
export default CustomWaveform;
