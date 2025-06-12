import React, { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';

import { PlayerState, RecorderState } from '@simform_solutions/react-native-audio-waveform';
import Svg, { Rect } from 'react-native-svg';

import styles, { BAR_MIN_HEIGHT, BAR_SPACE_DEFAULT, BAR_WIDTH_DEFAULT, WAVEFORM_HEIGHT, WAVEFORM_WIDTH } from './styles';
import { CustomWaveformProps } from './types';

import theme from '~/app/theme';
import { getScaleWidth } from '~/framework/components/constants';
import { BodyText } from '~/framework/components/text';

const TIMER_PLACEHOLDER = '0:00';
const MIN_AMP_OUT = 0;
const MAX_AMP_OUT = 1;

// This function scales the values of the decibels captured by the mic
function interpolate(value: number, minIn: number, maxIn: number, minOut: number, maxOut: number): number {
  if (value <= minIn) return minOut;
  if (value >= maxIn) return maxOut;
  return ((value - minIn) / (maxIn - minIn)) * (maxOut - minOut) + minOut;
}

const CustomWaveform: React.FC<CustomWaveformProps> = ({
  amplitude,
  audioTotalDuration,
  barColor = theme.palette.primary.regular,
  barSpace = BAR_SPACE_DEFAULT,
  barWidth = BAR_WIDTH_DEFAULT,
  maxBars = 50,
  mode,
  playerState,
  recordedBars = [],
  recorderState,
  resetPlayer,
  setRecordedBars,
  speed = 50,
}) => {
  const [recorderBars, setRecorderBars] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingStartTimeRef = useRef<number | null>(null);
  const accumulatedRecordingTimeRef = useRef(0);
  const [playerTime, setPlayerTime] = useState(0);
  const playerStartTimeRef = useRef<number | null>(null);
  const accumulatedPlayerTimeRef = useRef(0);

  const [displayedPlayerBars, setDisplayedPlayerBars] = useState(0);
  const playerBarsRef = useRef<number[]>([]);

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
  const barsToRenderInPlayer = React.useMemo(() => {
    return recordedBars ? [...recordedBars] : [];
  }, [recordedBars]);
  const totalRecordedBars = barsToRenderInPlayer.length;

  // Handles the waveform bars display and height calculation for recording mode
  useEffect(() => {
    if (recorderState === RecorderState.recording) {
      intervalRef.current = setInterval(() => {
        if (typeof amplitude === 'number' && !isNaN(amplitude) && isFinite(amplitude)) {
          setRecorderBars(prev => {
            let normalizedAmp = interpolate(amplitude, minAmpIn, maxAmpIn, MIN_AMP_OUT, MAX_AMP_OUT);
            normalizedAmp *= Math.random() * randomness + 1 - randomness / 2;
            normalizedAmp = Math.pow((1 - Math.cos(normalizedAmp * Math.PI)) / 2, 2.5);

            const barHeight = Math.max(BAR_MIN_HEIGHT, normalizedAmp * WAVEFORM_HEIGHT);
            // Saves the bars to display in the player
            playerBarsRef.current = [...playerBarsRef.current, barHeight];

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

  // @todo : voir si je peux save une seule fois à la fin sur le clic sur stop---------------------------------
  // Saves the bars from recording to then display them in the player
  useEffect(() => {
    if (setRecordedBars) {
      // console.log('allbars at the end', [...allBarsRef.current]);
      console.log('ça va settttt--------------');
      setRecordedBars([...playerBarsRef.current]);
    }
  }, [setRecordedBars]);

  // Handles the waveform bars display for playback mode
  useEffect(() => {
    if (playerState === PlayerState.playing) {
      setDisplayedPlayerBars(0); // reset au début de la lecture
      let interval = setInterval(() => {
        setDisplayedPlayerBars(prev => {
          if (prev < totalRecordedBars) {
            const nextBar = prev + 1;
            // console.log(`Barre affichée: ${nextBar}/${totalRecordedBars}`);
            return nextBar;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, speed);
      return () => clearInterval(interval);
    } else if (playerState === PlayerState.stopped) {
      setDisplayedPlayerBars(0); // reset si on stoppe
    }
  }, [playerState, totalRecordedBars, speed]);

  // TIMER FOR RECORDING MODE
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

  // TIMER FOR PLAYBACK MODE
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
    // Generate waveform for recording mode
    if (recorderState === RecorderState.recording || recorderState === RecorderState.paused) {
      return recorderBars
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
      // Generate waveform for playback mode
    } else {
      const windowSize = maxBars;
      const start = displayedPlayerBars <= windowSize ? 0 : displayedPlayerBars - windowSize;
      const end = start + windowSize;
      const visibleBars = barsToRenderInPlayer.slice(start, end);
      let paddedBars = visibleBars;
      if (visibleBars.length < windowSize) {
        paddedBars = [...visibleBars, ...Array(windowSize - visibleBars.length).fill(0)];
      }

      return paddedBars.map((bar, i) => {
        const barIndex = start + i;
        const isPlayed = barIndex < displayedPlayerBars;
        const x = i * (barWidth + barSpace);
        return (
          <Rect
            key={barIndex}
            x={x}
            y={(WAVEFORM_HEIGHT - bar) / 2}
            width={barWidth}
            height={bar}
            rx={barWidth / 2}
            fill={isPlayed ? barColor : theme.palette.primary.light}
            opacity={0.8}
          />
        );
      });
    }
  }, [recorderState, recorderBars, barWidth, barSpace, barColor, maxBars, displayedPlayerBars, barsToRenderInPlayer]);

  const waveformContainerStyle = React.useMemo(
    () => [
      styles.waveformAndTimerContainer,
      { backgroundColor: mode === 'Recorder' ? theme.palette.grey.white : theme.palette.primary.pale },
    ],
    [mode],
  );

  return (
    <View style={waveformContainerStyle}>
      <View style={styles.waveform}>
        <Svg width={WAVEFORM_WIDTH} height={WAVEFORM_HEIGHT}>
          {renderWaveformBars()}
        </Svg>
      </View>
      <View style={styles.timer}>
        <BodyText>{timerValue ?? TIMER_PLACEHOLDER}</BodyText>
      </View>
    </View>
  );
};

export default CustomWaveform;
