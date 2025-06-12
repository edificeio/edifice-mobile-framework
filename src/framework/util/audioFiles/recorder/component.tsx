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
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
import { useWaveformBars } from '~/framework/util/audioFiles/hook/useWaveFormBars';
import AudioPlayer from '~/framework/util/audioFiles/player';
import CustomWaveform from '~/framework/util/audioFiles/waveform';
import { LocalFile } from '~/framework/util/fileHandler';
import { Asset } from '~/framework/util/fileHandler/types';

const { AudioWaveform, AudioWaveformsEventEmitter } = NativeModules;

const AudioRecorder = () => {
  const recorder = useAudioRecorder();
  const { checkHasAudioRecorderPermission, getAudioRecorderPermission } = useAudioPermission();
  const waveformRef = useRef<IWaveformRef>(null);
  const [recorderState, setRecorderState] = useState<RecorderState>(RecorderState.stopped);
  const [currentAmplitude, setCurrentAmplitude] = useState<number>(0);
  const [isRecordDeleted, setIsRecordDeleted] = useState<boolean>(false);
  const [showPlayer, setShowPlayer] = useState<boolean>(false);

  // States of the waveForm and the URI of the file captured during recording, which need to be passed to the player
  const { barsRef, setBars } = useWaveformBars();
  const [audioFile, setAudioFile] = useState<string | null>(null);

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

  // Format the audio file as an Asset before making it a LocalFile
  const processAudio = async (filePath: string): Promise<Asset> => {
    try {
      const fileStats = await RNFS.stat(filePath);
      const fileName = filePath.split('/').pop();
      console.log('fileName---------', fileName);
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

  // The stopRecording function returns the URI of the recorded audio file
  const onStopRecord = async () => {
    if (recorderState !== RecorderState.stopped) {
      try {
        const audioFilePath = await recorder.stopRecording();
        console.log('audioFilePath------------', audioFilePath);
        setAudioFile(audioFilePath[0]);
        setShowPlayer(true);
        setRecorderState(RecorderState.stopped);

        if (audioFilePath) {
          const audioAsset = await processAudio(audioFilePath[0]);
          const fileToSave = new LocalFile(audioAsset, { _needIOSReleaseSecureAccess: false });
          console.log('fileToSave', fileToSave);
        }
      } catch (error) {
        console.error('Error stopping the recording:', error);
      }
    }
  };

  const resetRecorderFromPlayer = () => {
    setShowPlayer(false);
    setIsRecordDeleted(true);
    setAudioFile(null);
    barsRef.current = [];
    setBars([]);
  };

  const timeRef = React.useRef<number>(0);

  // Listen to the decibels captured by the mic native module
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
    <AudioPlayer filePath={audioFile!!} recordedBars={barsRef.current} resetRecorder={resetRecorderFromPlayer} />
  ) : (
    <View style={styles.container}>
      <View style={styles.waveformContainer}>
        {recorderState === RecorderState.stopped && (!showPlayer || isRecordDeleted) ? (
          <BodyText style={styles.placeholderText}>Touchez pour commencer</BodyText>
        ) : (
          <CustomWaveform
            amplitude={currentAmplitude}
            recorderState={recorderState}
            speed={1 / 30}
            maxBars={60}
            ref={waveformRef}
            setRecordedBars={setBars}
          />
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={onDeleteRecord}
          style={deleteButtonStyle}
          disabled={!(recorderState === RecorderState.recording || recorderState === RecorderState.paused)}>
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
