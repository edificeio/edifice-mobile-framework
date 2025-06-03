import React, { useRef, useState } from 'react';
import { NativeEventEmitter, NativeModules, PermissionsAndroid, Platform, TouchableOpacity, View } from 'react-native';

import {
  IWaveformRef,
  PermissionStatus,
  RecorderState,
  UpdateFrequency,
  useAudioPermission,
} from '@simform_solutions/react-native-audio-waveform';
import { useAudioRecorder } from '@simform_solutions/react-native-audio-waveform/lib/hooks';
import RNFS from 'react-native-fs';

import CustomWaveform from './CustomWaveForm';
import styles from './styles';

import { Svg } from '~/framework/components/picture';
import { LocalFile } from '~/framework/util/fileHandler';
import { Asset } from '~/framework/util/fileHandler/types';

const { AudioWaveform, AudioWaveformsEventEmitter } = NativeModules;

const AudioRecorder = () => {
  const recorder = useAudioRecorder();
  const waveformRef = useRef<IWaveformRef>(null);
  const [recorderState, setRecorderState] = useState<RecorderState>(RecorderState.stopped);
  const { checkHasAudioRecorderPermission, getAudioRecorderPermission } = useAudioPermission();
  const [currentAmplitude, setCurrentAmplitude] = useState<number>(0);
  const [recordingTime, setRecordingTime] = useState(0);

  const requestPermissionIfNeeded = React.useCallback(async (): Promise<boolean> => {
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
  }, [checkHasAudioRecorderPermission, getAudioRecorderPermission]);

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

  const handleRecorderPress = async () => {
    const hasPermission = await requestPermissionIfNeeded();
    if (!hasPermission) return;

    if (recorderState === RecorderState.stopped) {
      await recorder.startRecording({ updateFrequency: UpdateFrequency.high });
      setRecorderState(RecorderState.recording);
    } else if (recorderState === RecorderState.recording) {
      await recorder.pauseRecording();
      setRecorderState(RecorderState.paused);
    } else if (recorderState === RecorderState.paused) {
      await recorder.resumeRecording();
      setRecorderState(RecorderState.recording);
    }
  };

  const handleStopRecordPress = async () => {
    if (recorderState !== RecorderState.stopped) {
      try {
        const audioFilePath = await recorder.stopRecording();
        setRecorderState(RecorderState.stopped);

        if (audioFilePath) {
          const audioAsset = await processAudio(audioFilePath[0]);
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

  const timeRef = React.useRef<number>(0);

  React.useEffect(() => {
    let emitter: NativeEventEmitter | null = null;
    let subscription: any;

    if (Platform.OS === 'ios' && AudioWaveformsEventEmitter) {
      emitter = new NativeEventEmitter(AudioWaveformsEventEmitter);
    } else if (Platform.OS === 'android' && AudioWaveform) {
      emitter = new NativeEventEmitter(AudioWaveform);
    }

    if (emitter) {
      console.log('emitttttt', emitter);
      subscription = emitter.addListener('onCurrentRecordingWaveformData', event => {
        console.log('📈 Live amplitude data:', event, performance.now() - timeRef.current);
        timeRef.current = performance.now();
        setCurrentAmplitude(event.currentDecibel ?? 0);
      });
    }

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (recorderState === RecorderState.recording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recorderState]);

  React.useEffect(() => {
    if (recorderState === RecorderState.stopped) {
      setRecordingTime(0);
    }
  }, [recorderState]);

  const timerValue = `${String(Math.floor(recordingTime / 60)).padStart(1, '0')}:${String(recordingTime % 60).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      {/* <Waveform
        ref={waveformRef}
        candleHeightScale={candleHeightScale}
        candleSpace={2}
        candleWidth={3}
        containerStyle={styles.waveform}
        mode="live"
        onRecorderStateChange={setRecorderState}
        waveColor={theme.palette.primary.regular as string}
      /> */}
      <CustomWaveform
        amplitude={currentAmplitude}
        height={40}
        recorderState={recorderState}
        speed={1 / 60} // vitesse d'apparition des barres (ms)
        maxBars={60}
        ref={waveformRef}
        timerValue={timerValue}
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
