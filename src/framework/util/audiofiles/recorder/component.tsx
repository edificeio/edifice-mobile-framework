import React, { useRef, useState } from 'react';
import { PermissionsAndroid, Platform, TouchableOpacity, View } from 'react-native';

import {
  IWaveformRef,
  PermissionStatus,
  RecorderState,
  UpdateFrequency,
  useAudioPermission,
  Waveform,
} from '@simform_solutions/react-native-audio-waveform';
import RNFS from 'react-native-fs';

import styles from './styles';

import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';
import { LocalFile } from '~/framework/util/fileHandler';
import { Asset } from '~/framework/util/fileHandler/types';

const AudioRecorder = () => {
  const waveformRef = useRef<IWaveformRef>(null);
  const [recorderState, setRecorderState] = useState<RecorderState>(RecorderState.stopped);
  const candleHeightScale = React.useMemo(() => (Platform.OS === 'ios' ? 1 : 6), []);

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
          const fileToSave = new LocalFile(audioAsset, { _needIOSReleaseSecureAccess: false });
          console.log('fileToSave', fileToSave);
          // open with old player
          fileToSave.open();
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
        candleHeightScale={candleHeightScale}
        candleSpace={2}
        candleWidth={3}
        containerStyle={styles.waveform}
        mode="live"
        onRecorderStateChange={setRecorderState}
        waveColor={theme.palette.primary.regular as string}
      />
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={handleRecorderPress} style={styles.button}>
          <Svg
            height={20}
            width={20}
            fill={'black'}
            name={recorderState === RecorderState.stopped || recorderState === RecorderState.paused ? 'ui-mic' : 'ui-pause'}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleStopRecordPress} style={styles.button}>
          <Svg height={20} width={20} fill={'black'} name={'pictos-close'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AudioRecorder;
