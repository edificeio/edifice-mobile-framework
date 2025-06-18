import React, { useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';

import { PlayerState, UpdateFrequency, useAudioPlayer } from '@simform_solutions/react-native-audio-waveform';
import { DurationType, FinishMode } from '@simform_solutions/react-native-audio-waveform/lib/constants';

import { LocalFile } from '../../fileHandler';
import styles from './styles';
import { AudioPlayerProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import CustomWaveform from '~/framework/util/audioFiles/waveform';

const BARS_DISPLAY_SPEED = 30;

const AudioPlayer = ({ audioFile, onCancel, onError, onSave, recordedBarsForPlayer, resetRecorder }: AudioPlayerProps) => {
  const [audioTotalDuration, setAudioTotalDuration] = useState<number>(0);
  const player = useAudioPlayer();
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.stopped);
  const filePath = audioFile.nativeInfo.uri;
  // playerKey is the identifier of the player's current instance
  const playerKey = React.useMemo(() => `PlayerFor${filePath}`, [filePath]);
  const barsDisplaySpeed = React.useMemo(() => (Platform.OS === 'ios' ? 30 : 20), []);

  const preparePlayerForPath = async (fileUri: string) => {
    if (fileUri) {
      try {
        const isPlayerReady = await player.preparePlayer({
          path: fileUri,
          playerKey: playerKey,
          updateFrequency: UpdateFrequency.high,
          volume: 100,
        });
        return isPlayerReady;
      } catch (e) {
        return Promise.reject(e);
      }
    } else {
      return Promise.reject(new Error(`Can not start player for path: ${fileUri}`));
    }
  };

  const getAudioTotalDuration = async () => {
    try {
      const duration = await player.getDuration({
        durationType: DurationType.max,
        playerKey: playerKey,
      });
      if (duration) {
        const audioDuration = Number(duration);
        setAudioTotalDuration(audioDuration > 0 ? audioDuration : 0);
        return audioDuration;
      } else {
        return Promise.reject(new Error(`Could not get duration for path: ${filePath}`));
      }
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const preparePlayerAndGetDuration = async () => {
    try {
      const prepare = await preparePlayerForPath(filePath);
      if (prepare) {
        const duration = await getAudioTotalDuration();
        if (duration < 0) {
          await getAudioTotalDuration();
        }
      }
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const onPlayPausePlayer = async () => {
    if (playerState === PlayerState.playing) {
      await player.pausePlayer({ playerKey });
      setPlayerState(PlayerState.paused);
    } else if (playerState === PlayerState.paused || playerState === PlayerState.stopped) {
      await player.playPlayer({
        finishMode: FinishMode.stop,
        path: filePath,
        playerKey,
        speed: 1.0,
      });
      setPlayerState(PlayerState.playing);
    }
  };

  const onDeleteFile = async () => {
    await player.stopPlayer({ playerKey });
    resetRecorder();
    setPlayerState(PlayerState.stopped);
  };

  const onSaveFile = (fileToSave: LocalFile) => {
    console.log('Saving audio file:', fileToSave, onSave);
    onSave?.([fileToSave]);
  };

  const resetPlayer = async () => {
    await player.stopPlayer({ playerKey });
    setPlayerState(PlayerState.stopped);
    // On a reset, we have to re-prepare the player for the next playback
    await preparePlayerForPath(filePath);
  };

  // Prepare player on every source file change
  // don't include other suggested dependencies to avoid re-preparing the player in other cases than file change
  React.useEffect(() => {
    preparePlayerAndGetDuration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filePath, playerKey]);

  return (
    <View style={styles.container}>
      <CustomWaveform
        audioTotalDuration={audioTotalDuration}
        maxBars={60}
        mode="Player"
        playerState={playerState}
        recordedBarsForPlayer={recordedBarsForPlayer}
        resetPlayer={resetPlayer}
        speed={barsDisplaySpeed}
      />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={onDeleteFile} style={styles.buttonDelete}>
          <Svg
            height={UI_SIZES.dimensions.height.mediumPlus}
            width={UI_SIZES.dimensions.width.mediumPlus}
            fill={theme.palette.grey.darkness}
            name="ui-delete"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onPlayPausePlayer} style={styles.buttonPlayPause}>
          <Svg
            height={UI_SIZES.dimensions.height.mediumPlus}
            width={UI_SIZES.dimensions.width.mediumPlus}
            fill={theme.palette.primary.regular}
            name={playerState === PlayerState.playing ? 'ui-pause' : 'ui-play'}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onSaveFile(audioFile)} style={styles.buttonSave}>
          <Svg
            height={UI_SIZES.dimensions.height.mediumPlus}
            width={UI_SIZES.dimensions.width.mediumPlus}
            fill={theme.palette.grey.white}
            name={'ui-check'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AudioPlayer;
