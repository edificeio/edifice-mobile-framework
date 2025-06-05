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

import styles from './styles';

import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
import CustomWaveform from '~/framework/util/audioFiles/waveform/';
import { LocalFile } from '~/framework/util/fileHandler';
import { Asset } from '~/framework/util/fileHandler/types';

const PlayerComponent = () => <BodyText>PLAYEEEER</BodyText>;

const { AudioWaveform, AudioWaveformsEventEmitter } = NativeModules;

const AudioRecorder = () => {
  const recorder = useAudioRecorder();
  const { checkHasAudioRecorderPermission, getAudioRecorderPermission } = useAudioPermission();
  const waveformRef = useRef<IWaveformRef>(null);
  const [recorderState, setRecorderState] = useState<RecorderState>(RecorderState.stopped);
  const [currentAmplitude, setCurrentAmplitude] = useState<number>(0);
  const [isRecordDeleted, setIsRecordDeleted] = useState<boolean>(false);
  const [isRecordFulfilled, setIsRecordFulfilled] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

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

  const onStopRecord = async () => {
    if (recorderState !== RecorderState.stopped) {
      try {
        const audioFilePath = await recorder.stopRecording();
        setIsRecordFulfilled(true);
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

  const onDeleteRecord = async () => {
    await recorder.stopRecording();
    setRecorderState(RecorderState.stopped);
    setIsRecordDeleted(true);
    setIsRecordFulfilled(false);
  };

  const onPauseRecord = async () => {
    if (recorderState === RecorderState.recording) {
      await recorder.pauseRecording();
      setRecorderState(RecorderState.paused);
    }
  };

  const onResumeRecord = async () => {
    if (recorderState === RecorderState.paused) {
      await recorder.resumeRecording();
      setRecorderState(RecorderState.recording);
    }
  };

  const onStartRecord = async () => {
    if (recorderState === RecorderState.stopped) {
      setIsRecordDeleted(false);
      await recorder.startRecording({ updateFrequency: UpdateFrequency.high });
      setRecorderState(RecorderState.recording);
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
        // console.log('📈 Live amplitude data:', event, performance.now() - timeRef.current);
        timeRef.current = performance.now();
        setCurrentAmplitude(event.currentDecibel ?? 0);
      });
    }

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  React.useEffect(() => {
    console.log(recorderState, 'recorderState-----');
  }, [recorderState]);

  // Request audio permission on component mount
  React.useEffect(() => {
    async function getAudioPermission() {
      const isPermissionGranted = await requestPermissionIfNeeded();
      setHasPermission(isPermissionGranted);
    }
    getAudioPermission();
  }, [requestPermissionIfNeeded]);

  const deleteButtonStyle = React.useMemo(
    () => [
      styles.buttonDelete,
      { opacity: recorderState === RecorderState.recording || recorderState === RecorderState.paused ? 1 : 0 },
    ],
    [recorderState],
  );

  const pauseButtonStyle = React.useMemo(
    () => [
      styles.buttonPause,
      { opacity: recorderState === RecorderState.recording || recorderState === RecorderState.paused ? 1 : 0 },
    ],
    [recorderState],
  );

  return isRecordFulfilled ? (
    <PlayerComponent />
  ) : (
    <View style={styles.container}>
      <View style={styles.waveformContainer}>
        {recorderState === RecorderState.stopped && (!isRecordFulfilled || isRecordDeleted) ? (
          <BodyText style={styles.placeholderText}>Touchez pour commencer</BodyText>
        ) : (
          <CustomWaveform
            amplitude={currentAmplitude}
            height={40}
            recorderState={recorderState}
            speed={1 / 30}
            maxBars={60}
            ref={waveformRef}
          />
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={onDeleteRecord}
          style={deleteButtonStyle}
          disabled={!(recorderState === RecorderState.recording || recorderState === RecorderState.paused)}>
          <Svg height={20} width={20} fill={theme.palette.grey.darkness} name="ui-delete" />
        </TouchableOpacity>

        {recorderState === RecorderState.stopped && (!isRecordFulfilled || isRecordDeleted) ? (
          <TouchableOpacity onPress={onStartRecord} style={styles.buttonPlayStop}>
            <Svg height={20} width={20} fill={theme.palette.grey.white} name="ui-mic" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onStopRecord} style={styles.buttonPlayStop}>
            <Svg height={20} width={20} fill={theme.palette.grey.white} name="ui-stop" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={recorderState === RecorderState.paused ? onResumeRecord : onPauseRecord}
          style={pauseButtonStyle}
          disabled={!(recorderState === RecorderState.recording || recorderState === RecorderState.paused)}>
          <Svg
            height={20}
            width={20}
            fill={theme.palette.grey.white}
            name={recorderState === RecorderState.paused ? 'ui-mic' : 'ui-pause-filled'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AudioRecorder;
