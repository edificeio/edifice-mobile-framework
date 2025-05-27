import React, { useRef, useState } from 'react';
import { NativeEventEmitter, NativeModules, PermissionsAndroid, Platform, TouchableOpacity, View } from 'react-native';

const { AudioWaveform, AudioWaveformsEventEmitter } = NativeModules;

import {
  IWaveformRef,
  PermissionStatus,
  RecorderState,
  UpdateFrequency,
  useAudioPermission
} from '@simform_solutions/react-native-audio-waveform';
import RNFS from 'react-native-fs';

import CustomWaveform from './CustomWaveForm';
import styles from './styles';

import { Svg } from '~/framework/components/picture';
import { LocalFile } from '~/framework/util/fileHandler';
import { Asset } from '~/framework/util/fileHandler/types';

const AudioRecorder = () => {
  const waveformRef = useRef<IWaveformRef>(null);
  const [recorderState, setRecorderState] = useState<RecorderState>(RecorderState.stopped);
  const candleHeightScale = React.useMemo(() => (Platform.OS === 'ios' ? 1 : 6), []);
  const { checkHasAudioRecorderPermission, getAudioRecorderPermission } = useAudioPermission();

  const [isRecording, setIsRecording] = useState(false);

  // Simule une amplitude aléatoire (remplace par la vraie valeur de ton micro)
  const getNextAmplitude = () => Math.random();

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
      setIsRecording(true);
      setRecorderState(RecorderState.recording);
    } else if (recorderState === RecorderState.recording) {
      await waveformRef.current?.pauseRecord();
      setIsRecording(false);
      setRecorderState(RecorderState.paused);
    } else if (recorderState === RecorderState.paused) {
      await waveformRef.current?.resumeRecord();
      setRecorderState(RecorderState.recording);
      setIsRecording(true);
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
    setIsRecording(false);
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

  React.useEffect(() => {
    let emitter: NativeEventEmitter | null = null;
    let subscription: any;

    if (Platform.OS === 'ios' && AudioWaveformsEventEmitter) {
      emitter = new NativeEventEmitter(AudioWaveformsEventEmitter);
    } else if (Platform.OS === 'android' && AudioWaveform) {
      emitter = new NativeEventEmitter(AudioWaveform);
    }

    if (emitter) {
      subscription = emitter.addListener('onCurrentRecordingWaveformData', event => {
        // event.currentDecibel (Android) ou event.currentDecibel (iOS)
        console.log('📈 Live amplitude data:', event);
        // Utilise event.currentDecibel pour ton CustomWaveform
      });
    }

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

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
        width={300}
        height={40}
        isRecording={isRecording}
        getNextAmplitude={getNextAmplitude}
        speed={80} // vitesse d'apparition des barres (ms)
        maxBars={60}
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
