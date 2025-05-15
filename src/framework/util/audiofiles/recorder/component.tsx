import React, { useRef, useState } from 'react';
import { PermissionsAndroid, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import {
  IWaveformRef,
  PermissionStatus,
  PlayerState,
  RecorderState,
  UpdateFrequency,
  useAudioPermission,
  Waveform,
} from '@simform_solutions/react-native-audio-waveform';
import RNFS from 'react-native-fs';

import { LocalFile } from '../../fileHandler';
import { Asset } from '../../fileHandler/types';

import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';
import { uploadWorkspaceFileAction } from '~/framework/modules/workspace/actions/fileTransfer';

const RecorderPlayer = () => {
  const waveformRef = useRef<IWaveformRef>(null);
  const [recorderState, setRecorderState] = useState<RecorderState>(RecorderState.stopped);
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.stopped);

  const { checkHasAudioRecorderPermission, getAudioRecorderPermission } = useAudioPermission();

  const requestPermissionIfNeeded = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    const status = await checkHasAudioRecorderPermission();
    if (status === PermissionStatus.granted) return true;
    if (status === PermissionStatus.undetermined) {
      const newStatus = await getAudioRecorderPermission();
      return newStatus === PermissionStatus.granted;
    }
    return false;
  };

  // const handlePlayerPress = async () => {
  //   if (playerState === PlayerState.stopped || playerState === PlayerState.paused) {
  //     await waveformRef.current?.startPlayer();
  //     setPlayerState(PlayerState.playing);
  //   } else if (playerState === PlayerState.playing) {
  //     await waveformRef.current?.pausePlayer();
  //     setPlayerState(PlayerState.paused);
  //   }
  // };

  const handleRecorderPress = async () => {
    const hasPermission = await requestPermissionIfNeeded();
    if (!hasPermission) return;

    if (recorderState === RecorderState.stopped) {
      await waveformRef.current?.startRecord({ updateFrequency: UpdateFrequency.high });
      setRecorderState(RecorderState.recording);
    } else if (recorderState === RecorderState.recording) {
      await waveformRef.current?.pauseRecord();
      setRecorderState(RecorderState.paused);
    } else if (recorderState === RecorderState.paused) {
      await waveformRef.current?.resumeRecord();
      setRecorderState(RecorderState.recording);
    }
  };

  // const saveAudioFile = async (filePath: string) => {
  //   const destinationPath = `${RNFS.DocumentDirectoryPath}/recordedAudio.wav`;
  //   try {
  //     await RNFS.moveFile(filePath, destinationPath);
  //     console.log('File saved to:', destinationPath);
  //   } catch (error) {
  //     console.error('Error saving file:', error);
  //   }
  // };

  const processAudio = async (filePath: string): Promise<Asset> => {
    try {
      const fileStats = await RNFS.stat(filePath);
      const fileName = filePath.split('/').pop();
      console.log('fileStaaaats', fileStats);

      return {
        fileName,
        fileSize: fileStats.size,
        originalPath: filePath,
        type: 'audio',
        uri: `file://${filePath}`,
      };
    } catch (error) {
      console.error('Error formatting audio as Asset:', error as Error);
      throw error;
    }
  };

  const handleStopRecordPress = async () => {
    if (recorderState !== RecorderState.stopped) {
      try {
        const audioFilePath = await waveformRef.current?.stopRecord();
        setRecorderState(RecorderState.stopped);

        if (audioFilePath) {
          const audioAsset = await processAudio(audioFilePath);
          console.log('Formatted Asset:', audioAsset);
          const fileToSave = new LocalFile(audioAsset, { _needIOSReleaseSecureAccess: false });
          console.log('fileToSave', fileToSave);

          // ne fonctionne pas
          uploadWorkspaceFileAction('owner', fileToSave);
          // fileToSave.open();
        }
      } catch (error) {
        console.error('Error stopping the recording:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Waveform
        ref={waveformRef}
        mode="live"
        containerStyle={styles.waveform}
        candleWidth={3}
        candleSpace={2}
        waveColor={theme.palette.primary.regular as string}
        onRecorderStateChange={setRecorderState}
      />
      <View style={styles.buttonsContainer}>
        {/* <TouchableOpacity onPress={handlePlayerPress} style={styles.button} disabled={recorderState === RecorderState.recording}>
          <Svg height={20} width={20} fill={'black'} name={playerState === PlayerState.playing ? 'ui-pause' : 'ui-play'} />
        </TouchableOpacity> */}

        <TouchableOpacity onPress={handleRecorderPress} style={styles.button} disabled={playerState === PlayerState.playing}>
          <Svg height={20} width={20} fill={'black'} name={recorderState === RecorderState.stopped ? 'ui-mic' : 'ui-pause'} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleStopRecordPress} style={styles.button}>
          <Svg height={20} width={20} fill={'black'} name={'pictos-close'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    backgroundColor: theme.palette.primary.regular,
    borderRadius: 50,
    padding: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  waveform: {
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    height: 100,
    marginBottom: 30,
  },
});

export default RecorderPlayer;
