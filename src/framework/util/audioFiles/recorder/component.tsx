import React, { useState } from 'react';
import { NativeEventEmitter, NativeModules, PermissionsAndroid, Platform, TouchableOpacity, View } from 'react-native';

import {
  PermissionStatus,
  RecorderState,
  UpdateFrequency,
  useAudioPermission,
} from '@simform_solutions/react-native-audio-waveform';
import { useAudioRecorder } from '@simform_solutions/react-native-audio-waveform/lib/hooks';
import RNFS from 'react-native-fs';

import styles from './styles';
import { AudioRecorderProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
import AudioPlayer from '~/framework/util/audioFiles/player';
import CustomWaveform from '~/framework/util/audioFiles/waveform';
import { LocalFile } from '~/framework/util/fileHandler';
import { Asset } from '~/framework/util/fileHandler/types';

const { AudioWaveform, AudioWaveformsEventEmitter } = NativeModules;

const AudioRecorder = ({ bottomSheetRef, promiseExecutorRef }: AudioRecorderProps) => {
  const recorder = useAudioRecorder();
  const { checkHasAudioRecorderPermission, getAudioRecorderPermission } = useAudioPermission();
  const [recorderState, setRecorderState] = useState<RecorderState>(RecorderState.stopped);
  const [currentAmplitude, setCurrentAmplitude] = useState<number>(0);
  const [isRecordDeleted, setIsRecordDeleted] = useState<boolean>(false);
  const [showPlayer, setShowPlayer] = useState<boolean>(false);
  const [audioFile, setAudioFile] = useState<LocalFile | null>(null);
  const barsDisplaySpeed = React.useMemo(() => (Platform.OS === 'ios' ? 30 : 20), []);
  const barsRef = React.useRef<number[]>([]);
  const [barsForPlayer, setBarsForPlayer] = useState<number[]>([]);

  const requestPermissionIfNeeded = React.useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    const status = await checkHasAudioRecorderPermission();
    if (status === PermissionStatus.granted) {
      return true;
    }

    if (status === PermissionStatus.undetermined) {
      const newStatus = await getAudioRecorderPermission();
      return newStatus === PermissionStatus.granted;
    }
    return false;
  }, [checkHasAudioRecorderPermission, getAudioRecorderPermission]);

  const formatAudioAsset = async (filePath: string): Promise<Asset> => {
    try {
      const fileStats = await RNFS.stat(filePath);
      const fileName = filePath.split('/').pop();

      return {
        fileName,
        fileSize: fileStats.size,
        originalPath: filePath,
        type: undefined, // will be known from extension
        uri: filePath,
      };
    } catch (error) {
      console.error('Error formatting audio as Asset:', error as Error);
      promiseExecutorRef?.current?.resolve([]);
      throw error;
    }
  };

  const onDeleteRecord = async () => {
    await recorder.stopRecording();
    setRecorderState(RecorderState.stopped);
    setIsRecordDeleted(true);
    setShowPlayer(false);
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
    const isPermissionGranted = await requestPermissionIfNeeded();
    if (!isPermissionGranted) return;
    if (recorderState === RecorderState.stopped) {
      setIsRecordDeleted(false);
      await recorder.startRecording({ updateFrequency: UpdateFrequency.high });
      setRecorderState(RecorderState.recording);
    }
  };

  // The stopRecording function returns the URI of the recorded audio file in cache
  const onStopRecord = async () => {
    if (recorderState !== RecorderState.stopped) {
      try {
        const audioFilePath = await recorder.stopRecording();
        setRecorderState(RecorderState.stopped);

        if (audioFilePath) {
          const audioAsset = await formatAudioAsset(audioFilePath[0]);
          const fileToSave = new LocalFile(audioAsset, { _needIOSReleaseSecureAccess: false });
          setAudioFile(fileToSave);
          setBarsForPlayer([...barsRef.current]);
          setShowPlayer(true);
        }
      } catch (error) {
        console.error('Error stopping the recording:', error);
        promiseExecutorRef?.current?.resolve([]);
      }
    }
  };

  const resetRecorderFromPlayer = () => {
    setShowPlayer(false);
    setIsRecordDeleted(true);
    setAudioFile(null);
    barsRef.current = [];
  };

  // Listen to the decibels captured by the native module
  // Triggers warning "new NativeEventEmitter()` was called with a non-null argument..."
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
        setCurrentAmplitude(event.currentDecibel ?? 0);
      });
    }

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

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

  return showPlayer ? (
    <AudioPlayer
      audioFile={audioFile!!}
      promiseExecutorRef={promiseExecutorRef}
      bottomSheetRef={bottomSheetRef}
      recordedBarsForPlayer={barsForPlayer}
      resetRecorder={resetRecorderFromPlayer}
    />
  ) : (
    <View style={styles.container}>
      {recorderState === RecorderState.stopped && (!showPlayer || isRecordDeleted) ? (
        <View style={styles.placeholderTextContainer}>
          <BodyText style={styles.placeholderText}>{I18n.get('audio-recorder-placeholder')}</BodyText>
        </View>
      ) : (
        <CustomWaveform
          amplitude={currentAmplitude}
          barsRef={barsRef}
          maxBars={60}
          mode="Recorder"
          recorderState={recorderState}
          speed={barsDisplaySpeed}
          stopRecorder={onStopRecord}
        />
      )}

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={onDeleteRecord}
          disabled={!(recorderState === RecorderState.recording || recorderState === RecorderState.paused)}
          style={deleteButtonStyle}>
          <Svg
            height={UI_SIZES.dimensions.height.mediumPlus}
            width={UI_SIZES.dimensions.width.mediumPlus}
            fill={theme.palette.grey.darkness}
            name="ui-delete"
          />
        </TouchableOpacity>

        {recorderState === RecorderState.stopped && (!showPlayer || isRecordDeleted) ? (
          <TouchableOpacity onPress={onStartRecord} style={styles.buttonPlayStop}>
            <Svg
              height={UI_SIZES.dimensions.height.mediumPlus}
              width={UI_SIZES.dimensions.width.mediumPlus}
              fill={theme.palette.grey.white}
              name="ui-mic"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onStopRecord} style={styles.buttonPlayStop}>
            <Svg
              height={UI_SIZES.dimensions.height.mediumPlus}
              width={UI_SIZES.dimensions.width.mediumPlus}
              fill={theme.palette.grey.white}
              name="ui-stop"
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={recorderState === RecorderState.paused ? onResumeRecord : onPauseRecord}
          style={pauseButtonStyle}
          disabled={!(recorderState === RecorderState.recording || recorderState === RecorderState.paused)}>
          <Svg
            height={UI_SIZES.dimensions.height.mediumPlus}
            width={UI_SIZES.dimensions.width.mediumPlus}
            fill={theme.palette.grey.white}
            name={recorderState === RecorderState.paused ? 'ui-mic' : 'ui-pause-filled'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AudioRecorder;
