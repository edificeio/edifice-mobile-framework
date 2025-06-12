import React, { ReactElement, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { PlayerState, UpdateFrequency, useAudioPlayer } from '@simform_solutions/react-native-audio-waveform';
import { DurationType, FinishMode } from '@simform_solutions/react-native-audio-waveform/lib/constants';

import styles from './styles';
import { AudioPlayerProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import CustomWaveform from '~/framework/util/audioFiles/waveform';

const AudioPlayer = ({ filePath, recordedBars, resetRecorder }): ReactElement<AudioPlayerProps> => {
  const [audioTotalDuration, setAudioTotalDuration] = useState<number>(0);
  const player = useAudioPlayer();
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.stopped);
  // playerKey is the identifier of the player's current instance
  const playerKey = React.useMemo(() => `PlayerFor${filePath}`, [filePath]);

  const preparePlayerForPath = async (filePatho: string) => {
    if (filePatho) {
      console.log('el pasiiiii', filePatho);
      try {
        const prepare = await player.preparePlayer({
          path: filePatho,
          playerKey: playerKey,
          updateFrequency: UpdateFrequency.medium,
          volume: 100,
        });
        return prepare;
      } catch (err) {
        return Promise.reject(err);
      }
    } else {
      return Promise.reject(new Error(`Can not start player for path: ${filePatho}`));
    }
  };

  const getAudioTotalDuration = async () => {
    try {
      const duration = await player.getDuration({
        durationType: DurationType.max,
        playerKey: playerKey,
      });
      console.log('duracioooon', duration);
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
      console.log('ça preppppp');
      const prepare = await preparePlayerForPath(filePath);
      if (prepare) {
        const duration = await getAudioTotalDuration();
        if (duration < 0) {
          await getAudioTotalDuration();
        }
      }
    } catch (err) {
      console.log(err);
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

  const resetPlayer = async () => {
    await player.stopPlayer({ playerKey });
    setPlayerState(PlayerState.stopped);
    // On a reset, we have to re-prepare the player for the next playback
    await preparePlayerForPath(filePath);
  };

  // Prepare player on every source file change
  // don't include suggested dependencies to avoid re-preparing the player
  React.useEffect(() => {
    preparePlayerAndGetDuration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filePath, playerKey]);

  React.useEffect(() => {
    console.log('songDuration', audioTotalDuration);
  }, [audioTotalDuration]);

  return (
    <View style={styles.container}>
      <View style={styles.waveformContainer}>
        <CustomWaveform
          maxBars={60}
          speed={1 / 30}
          playerState={playerState}
          recordedBars={recordedBars}
          audioTotalDuration={audioTotalDuration}
          resetPlayer={resetPlayer}
        />
      </View>

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

        <TouchableOpacity onPress={() => console.log('checkkkk fiiloss')} style={styles.buttonPause}>
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

// code extrait du package :

// import {
//   FinishMode,
//   IWaveformRef,
//   PermissionStatus,
//   PlaybackSpeedType,
//   PlayerState,
//   RecorderState,
//   UpdateFrequency,
//   Waveform,
//   useAudioPermission,
//   useAudioPlayer,
// } from '@simform_solutions/react-native-audio-waveform';
// import React, {
//   Dispatch,
//   SetStateAction,
//   useEffect,
//   useRef,
//   useState,
// } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   Linking,
//   Pressable,
//   ScrollView,
//   StatusBar,
//   Text,
//   View,
// } from 'react-native';
// import fs from 'react-native-fs';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';
// import { Icons } from './assets';
// import {
//   generateAudioList,
//   getRecordedAudios,
//   playbackSpeedSequence,
//   type ListItem,
// } from './constants';
// import stylesheet from './styles';
// import { Colors } from './theme';

// let currentPlayingRef: React.RefObject<IWaveformRef> | undefined;
// const RenderListItem = React.memo(
//   ({
//     item,
//     onPanStateChange,
//     currentPlaybackSpeed,
//     changeSpeed,
//   }: {
//     item: ListItem;
//     onPanStateChange: (value: boolean) => void;
//     currentPlaybackSpeed: PlaybackSpeedType;
//     changeSpeed: () => void;
//   }) => {
//     const ref = useRef<IWaveformRef>(null);
//     const [playerState, setPlayerState] = useState(PlayerState.stopped);
//     const styles = stylesheet({ currentUser: item.fromCurrentUser });
//     const [isLoading, setIsLoading] = useState(true);

//     const handlePlayPauseAction = async () => {
//       // If we are recording do nothing
//       if (
//         currentPlayingRef?.current?.currentState === RecorderState.recording
//       ) {
//         return;
//       }

//       const startNewPlayer = async () => {
//         currentPlayingRef = ref;
//         if (ref.current?.currentState === PlayerState.paused) {
//           await ref.current?.resumePlayer();
//         } else {
//           await ref.current?.startPlayer({
//             finishMode: FinishMode.stop,
//           });

//           // If the player took too much time to initialize and another player started instead we pause the former one!
//           if (
//             currentPlayingRef?.current?.playerKey !== ref?.current?.playerKey
//           ) {
//             await ref?.current?.pausePlayer();
//           }
//         }
//       };

//       // If no player or if current player is stopped just start the new player!
//       if (
//         currentPlayingRef == null ||
//         [PlayerState.stopped, PlayerState.paused].includes(
//           currentPlayingRef?.current?.currentState as PlayerState
//         )
//       ) {
//         await startNewPlayer();
//       } else {
//         // Pause current player if it was playing
//         if (currentPlayingRef?.current?.currentState === PlayerState.playing) {
//           await currentPlayingRef?.current?.pausePlayer();
//         }

//         // Start player when it is a different one!
//         if (currentPlayingRef?.current?.playerKey !== ref?.current?.playerKey) {
//           await startNewPlayer();
//         }
//       }
//     };

//     const handleStopAction = async () => {
//       ref.current?.stopPlayer();
//     };

//     return (
//       <View key={item.path} style={[styles.listItemContainer]}>
//         <View style={styles.listItemWidth}>
//           <View style={[styles.buttonContainer]}>
//             <Pressable
//               disabled={isLoading}
//               onPress={handlePlayPauseAction}
//               style={styles.playBackControlPressable}>
//               {isLoading ? (
//                 <ActivityIndicator color={'#FFFFFF'} />
//               ) : (
//                 <Image
//                   source={
//                     playerState !== PlayerState.playing
//                       ? Icons.play
//                       : Icons.pause
//                   }
//                   style={styles.buttonImage}
//                   resizeMode="contain"
//                 />
//               )}
//             </Pressable>
//             <Pressable
//               disabled={PlayerState.stopped == playerState}
//               onPress={handleStopAction}
//               style={styles.playBackControlPressable}>
//               <Image
//                 source={Icons.stop}
//                 style={[
//                   styles.stopButton,
//                   {
//                     opacity: playerState === PlayerState.stopped ? 0.5 : 1,
//                   },
//                 ]}
//                 resizeMode="contain"
//               />
//             </Pressable>
//             <Waveform
//               containerStyle={styles.staticWaveformView}
//               mode="static"
//               key={item.path}
//               playbackSpeed={currentPlaybackSpeed}
//               ref={ref}
//               path={item.path}
//               candleSpace={2}
//               candleWidth={4}
//               scrubColor={Colors.white}
//               waveColor={Colors.lightWhite}
//               candleHeightScale={4}
//               onPlayerStateChange={setPlayerState}
//               onPanStateChange={onPanStateChange}
//               onError={error => {
//                 console.log('Error in static player:', error);
//               }}
//               onCurrentProgressChange={(_currentProgress, _songDuration) => {
//                 // console.log(
//                 //   `currentProgress ${currentProgress}, songDuration ${songDuration}`
//                 // );
//               }}
//               onChangeWaveformLoadState={state => {
//                 setIsLoading(state);
//               }}
//             />
//             {playerState === PlayerState.playing ? (
//               <Pressable
//                 onPress={changeSpeed}
//                 style={[styles.speedBox, styles.whiteBackground]}>
//                 <Text style={styles.speed}>{`${currentPlaybackSpeed}x`}</Text>
//               </Pressable>
//             ) : (
//               <Image style={styles.speedBox} source={Icons.logo} />
//             )}
//           </View>
//         </View>
//       </View>
//     );
//   }
// );

// const LivePlayerComponent = ({
//   setList,
// }: {
//   setList: Dispatch<SetStateAction<ListItem[]>>;
// }) => {
//   const ref = useRef<IWaveformRef>(null);
//   const [recorderState, setRecorderState] = useState(RecorderState.stopped);
//   const styles = stylesheet();
//   const { checkHasAudioRecorderPermission, getAudioRecorderPermission } =
//     useAudioPermission();

//   const startRecording = () => {
//     ref.current
//       ?.startRecord({
//         updateFrequency: UpdateFrequency.high,
//       })
//       .then(() => {})
//       .catch(() => {});
//   };

//   const handleRecorderAction = async () => {
//     if (recorderState === RecorderState.stopped) {
//       // Stopping other player before starting recording
//       if (currentPlayingRef?.current?.currentState === PlayerState.playing) {
//         currentPlayingRef?.current?.stopPlayer();
//       }

//       const hasPermission = await checkHasAudioRecorderPermission();

//       if (hasPermission === PermissionStatus.granted) {
//         currentPlayingRef = ref;
//         startRecording();
//       } else if (hasPermission === PermissionStatus.undetermined) {
//         const permissionStatus = await getAudioRecorderPermission();
//         if (permissionStatus === PermissionStatus.granted) {
//           currentPlayingRef = ref;
//           startRecording();
//         }
//       } else {
//         Linking.openSettings();
//       }
//     } else {
//       ref.current?.stopRecord().then(path => {
//         setList(prev => [...prev, { fromCurrentUser: true, path }]);
//       });
//       currentPlayingRef = undefined;
//     }
//   };

//   return (
//     <View style={styles.liveWaveformContainer}>
//       <Waveform
//         mode="live"
//         containerStyle={styles.liveWaveformView}
//         ref={ref}
//         candleSpace={2}
//         candleWidth={4}
//         waveColor={Colors.pink}
//         onRecorderStateChange={setRecorderState}
//       />
//       <Pressable
//         onPress={handleRecorderAction}
//         style={styles.recordAudioPressable}>
//         <Image
//           source={
//             recorderState === RecorderState.stopped ? Icons.mic : Icons.stop
//           }
//           style={styles.buttonImageLive}
//           resizeMode="contain"
//         />
//       </Pressable>
//     </View>
//   );
// };

// const AppContainer = () => {
//   const [shouldScroll, setShouldScroll] = useState<boolean>(true);
//   const [list, setList] = useState<ListItem[]>([]);
//   const [nbOfRecording, setNumberOfRecording] = useState<number>(0);
//   const [currentPlaybackSpeed, setCurrentPlaybackSpeed] =
//     useState<PlaybackSpeedType>(1.0);

//   const { top, bottom } = useSafeAreaInsets();
//   const styles = stylesheet({ top, bottom });

//   useEffect(() => {
//     generateAudioList().then(audioListArray => {
//       if (audioListArray?.length > 0) {
//         setList(audioListArray);
//       }
//     });
//   }, []);

//   useEffect(() => {
//     getRecordedAudios().then(recordedAudios =>
//       setNumberOfRecording(recordedAudios.length)
//     );
//   }, [list]);

//   const changeSpeed = () => {
//     setCurrentPlaybackSpeed(
//       prev =>
//         playbackSpeedSequence[
//           (playbackSpeedSequence.indexOf(prev) + 1) %
//             playbackSpeedSequence.length
//         ] ?? 1.0
//     );
//   };

//   const handleDeleteRecordings = async () => {
//     const recordings = await getRecordedAudios();

//     const deleteRecordings = async () => {
//       await Promise.all(recordings.map(async recording => fs.unlink(recording)))
//         .then(() => {
//           generateAudioList().then(audioListArray => {
//             setList(audioListArray);
//           });
//         })
//         .catch(error => {
//           Alert.alert(
//             'Error deleting recordings',
//             'Below error happened while deleting recordings:\n' + error,
//             [{ text: 'Dismiss' }]
//           );
//         });
//     };

//     Alert.alert(
//       'Delete all recording',
//       `Continue to delete all ${recordings.length} recordings.`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'OK', onPress: deleteRecordings },
//       ]
//     );
//   };

//   const handleStopPlayersAndExtractors = async () => {
//     await currentPlayingRef?.current?.stopPlayer();

//     const { stopPlayersAndExtractors } = useAudioPlayer();
//     const hasStoppedAll: boolean[] = await stopPlayersAndExtractors();

//     if (hasStoppedAll.every(Boolean)) {
//       Alert.alert(
//         'Everything stopped',
//         'All players and extractors have been stopped!',
//         [{ text: 'OK' }]
//       );
//     } else {
//       Alert.alert(
//         'Error stopping everything',
//         'An error occurred when trying to stop players or extractors',
//         [{ text: 'OK' }]
//       );
//     }
//   };

//   return (
//     <View style={styles.appContainer}>
//       <StatusBar
//         barStyle={'dark-content'}
//         backgroundColor={'transparent'}
//         animated
//         translucent
//       />
//       <GestureHandlerRootView style={styles.appContainer}>
//         <View style={styles.screenBackground}>
//           <View style={styles.container}>
//             <View style={styles.simformImageContainer}>
//               <Image
//                 source={Icons.simform}
//                 style={styles.simformImage}
//                 resizeMode="contain"
//               />
//             </View>

//             <View style={styles.advancedOptionsContainer}>
//               <Pressable
//                 style={[
//                   styles.advancedOptionItem,
//                   { opacity: nbOfRecording ? 1 : 0.5 },
//                 ]}
//                 onPress={handleDeleteRecordings}
//                 disabled={!nbOfRecording}>
//                 <Image
//                   source={Icons.delete}
//                   style={styles.pinkButtonImage}
//                   resizeMode="contain"
//                 />
//                 <Text style={styles.advancedOptionItemTitle}>
//                   {'Delete recorded audio files'}
//                 </Text>
//               </Pressable>
//               <Pressable
//                 style={styles.advancedOptionItem}
//                 onPress={handleStopPlayersAndExtractors}>
//                 <Image
//                   source={Icons.stop}
//                   style={[styles.pinkButtonImage]}
//                   resizeMode="contain"
//                 />
//                 <Text style={styles.advancedOptionItemTitle}>
//                   {'Stop all players and extractors'}
//                 </Text>
//               </Pressable>
//             </View>

//             <ScrollView scrollEnabled={shouldScroll}>
//               {list.map(item => (
//                 <RenderListItem
//                   key={item.path}
//                   item={item}
//                   onPanStateChange={value => setShouldScroll(!value)}
//                   {...{ currentPlaybackSpeed, changeSpeed }}
//                 />
//               ))}
//             </ScrollView>
//           </View>
//           <LivePlayerComponent setList={setList} />
//         </View>
//       </GestureHandlerRootView>
//     </View>
//   );
// };

// export default function App() {
//   return (
//     <SafeAreaProvider>
//       <AppContainer />
//     </SafeAreaProvider>
//   );
// }

// import clamp from 'lodash/clamp';
// import floor from 'lodash/floor';
// import head from 'lodash/head';
// import isEmpty from 'lodash/isEmpty';
// import isNil from 'lodash/isNil';
// import React, {
//   forwardRef,
//   useEffect,
//   useImperativeHandle,
//   useRef,
//   useState,
// } from 'react';
// import {
//   PanResponder,
//   ScrollView,
//   View,
//   type LayoutRectangle,
//   type NativeTouchEvent,
// } from 'react-native';
// import {
//   DurationType,
//   FinishMode,
//   PermissionStatus,
//   playbackSpeedThreshold,
//   PlayerState,
//   RecorderState,
//   UpdateFrequency,
// } from '../../constants';
// import {
//   useAudioPermission,
//   useAudioPlayer,
//   useAudioRecorder,
// } from '../../hooks';
// import type { IStartRecording } from '../../types';
// import { WaveformCandle } from '../WaveformCandle';
// import styles from './WaveformStyles';
// import {
//   type IStartPlayerRef,
//   type IWaveform,
//   type IWaveformRef,
//   type LiveWaveform,
//   type StaticWaveform,
// } from './WaveformTypes';

// export const Waveform = forwardRef<IWaveformRef, IWaveform>((props, ref) => {
//   const {
//     // The maximum number of candles set in the waveform. Once this limit is reached, the oldest candle will be removed as a new one is added to the waveform.
//     maxCandlesToRender = 300,
//     mode,
//     path,
//     volume = 3,
//     // The playback speed of the audio player. A value of 1.0 represents normal playback speed.
//     playbackSpeed = 1.0,
//     candleSpace = 2,
//     candleWidth = 5,
//     containerStyle = {},
//     waveColor,
//     scrubColor,
//     onPlayerStateChange,
//     onRecorderStateChange,
//     onPanStateChange = () => {},
//     onError = (_error: Error) => {},
//     onCurrentProgressChange = () => {},
//     candleHeightScale = 3,
//     onChangeWaveformLoadState = (_state: boolean) => {},
//     showsHorizontalScrollIndicator = false,
//   } = props as StaticWaveform & LiveWaveform;
//   const viewRef = useRef<View>(null);
//   const scrollRef = useRef<ScrollView>(null);
//   const isLayoutCalculated = useRef<boolean>(false);
//   const isAutoPaused = useRef<boolean>(false);
//   const isAudioPlaying = useRef<boolean>(false);
//   const [waveform, setWaveform] = useState<number[]>([]);
//   const [viewLayout, setViewLayout] = useState<LayoutRectangle | null>(null);
//   const [seekPosition, setSeekPosition] = useState<NativeTouchEvent | null>(
//     null
//   );
//   const [songDuration, setSongDuration] = useState<number>(0);
//   const [noOfSamples, setNoOfSamples] = useState<number>(0);
//   const [currentProgress, setCurrentProgress] = useState<number>(0);
//   const [panMoving, setPanMoving] = useState(false);
//   const [playerState, setPlayerState] = useState(PlayerState.stopped);
//   const [recorderState, setRecorderState] = useState(RecorderState.stopped);
//   const [isWaveformExtracted, setWaveformExtracted] = useState(false);
//   const audioSpeed: number =
//     playbackSpeed > playbackSpeedThreshold ? 1.0 : playbackSpeed;

//   const {
//     extractWaveformData,
//     preparePlayer,
//     getDuration,
//     seekToPlayer,
//     playPlayer,
//     stopPlayer,
//     pausePlayer,
//     onCurrentDuration,
//     onDidFinishPlayingAudio,
//     onCurrentRecordingWaveformData,
//     setPlaybackSpeed,
//     markPlayerAsUnmounted,
//   } = useAudioPlayer();

//   const { startRecording, stopRecording, pauseRecording, resumeRecording } =
//     useAudioRecorder();

//   const { checkHasAudioRecorderPermission } = useAudioPermission();

//   /**
//    * Updates the playback speed of the audio player.
//    *
//    * @param speed - The new playback speed to set.
//    * @returns A Promise that resolves when the playback speed has been updated.
//    * @throws An error if there was a problem updating the playback speed.
//    */
//   const updatePlaybackSpeed = async (speed: number) => {
//     try {
//       await setPlaybackSpeed({ speed, playerKey: `PlayerFor${path}` });
//     } catch (error) {
//       console.error('Error updating playback speed', error);
//     }
//   };

//   useEffect(() => {
//     updatePlaybackSpeed(audioSpeed);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [audioSpeed]);

//   const preparePlayerForPath = async (progress?: number) => {
//     if (!isNil(path) && !isEmpty(path)) {
//       try {
//         const prepare = await preparePlayer({
//           path,
//           playerKey: `PlayerFor${path}`,
//           updateFrequency: UpdateFrequency.medium,
//           volume: volume,
//           progress,
//         });
//         return Promise.resolve(prepare);
//       } catch (err) {
//         return Promise.reject(err);
//       }
//     } else {
//       return Promise.reject(
//         new Error(`Can not start player for path: ${path}`)
//       );
//     }
//   };

//   const getAudioDuration = async () => {
//     try {
//       const duration = await getDuration({
//         playerKey: `PlayerFor${path}`,
//         durationType: DurationType.max,
//       });
//       if (!isNil(duration)) {
//         const audioDuration = Number(duration);
//         setSongDuration(audioDuration > 0 ? audioDuration : 0);
//         return Promise.resolve(audioDuration);
//       } else {
//         return Promise.reject(
//           new Error(`Could not get duration for path: ${path}`)
//         );
//       }
//     } catch (err) {
//       return Promise.reject(err);
//     }
//   };

//   const preparePlayerAndGetDuration = async () => {
//     try {
//       const prepare = await preparePlayerForPath();
//       if (prepare) {
//         const duration = await getAudioDuration();
//         if (duration < 0) {
//           await getAudioDuration();
//         }
//       }
//     } catch (err) {
//       onError(err as Error);
//     }
//   };

//   const getAudioWaveFormForPath = async (noOfSample: number) => {
//     if (!isNil(path) && !isEmpty(path)) {
//       try {
//         onChangeWaveformLoadState(true);
//         const result = await extractWaveformData({
//           path: path,
//           playerKey: `PlayerFor${path}`,
//           noOfSamples: Math.max(noOfSample, 1),
//         });
//         onChangeWaveformLoadState(false);

//         if (!isNil(result) && !isEmpty(result)) {
//           const waveforms = head(result);
//           if (!isNil(waveforms) && !isEmpty(waveforms)) {
//             setWaveform(waveforms);
//             await preparePlayerAndGetDuration();
//             setWaveformExtracted(true);
//           }
//         }
//       } catch (err) {
//         onChangeWaveformLoadState(false);
//         onError(err as Error);
//       }
//     } else {
//       onError(
//         new Error(`Can not find waveform for mode ${mode} path: ${path}`)
//       );
//     }
//   };

//   const stopPlayerAction = async (resetProgress = true) => {
//     if (mode === 'static') {
//       try {
//         const result = await stopPlayer({
//           playerKey: `PlayerFor${path}`,
//         });
//         isAudioPlaying.current = false;
//         if (!isNil(result) && result) {
//           if (resetProgress) {
//             setCurrentProgress(0);
//           }

//           setPlayerState(PlayerState.stopped);
//           return Promise.resolve(result);
//         } else {
//           return Promise.reject(
//             new Error(`error in stopping player for path: ${path}`)
//           );
//         }
//       } catch (err) {
//         return Promise.reject(err);
//       }
//     } else {
//       return Promise.reject(
//         new Error('error in stopping player: mode is not static')
//       );
//     }
//   };

//   const startPlayerAction = async (args?: IStartPlayerRef) => {
//     if (mode === 'static') {
//       try {
//         isAudioPlaying.current = true;
//         if (playerState === PlayerState.stopped) {
//           if (isWaveformExtracted) {
//             await preparePlayerForPath(currentProgress);
//           } else {
//             await getAudioWaveFormForPath(noOfSamples);
//           }
//         }

//         const play = await playPlayer({
//           finishMode: FinishMode.stop,
//           playerKey: `PlayerFor${path}`,
//           path: path,
//           speed: audioSpeed,
//           ...args,
//         });

//         if (play) {
//           setPlayerState(PlayerState.playing);
//           return Promise.resolve(true);
//         } else {
//           return Promise.reject(
//             new Error(`error in starting player for path: ${path}`)
//           );
//         }
//       } catch (error) {
//         if (playerState === PlayerState.paused) {
//           // If the player is not prepared, triggering the stop will reset the player for next click. Fix blocked paused player after a call to `stopAllPlayers`
//           await stopPlayerAction();
//         }

//         return Promise.reject(error);
//       }
//     } else {
//       return Promise.reject(
//         new Error('error in starting player: mode is not static')
//       );
//     }
//   };

//   const pausePlayerAction = async (changePlayerState = true) => {
//     if (mode === 'static') {
//       try {
//         isAudioPlaying.current = false;
//         const pause = await pausePlayer({
//           playerKey: `PlayerFor${path}`,
//         });
//         if (pause) {
//           if (changePlayerState) {
//             setPlayerState(PlayerState.paused);
//           }

//           return Promise.resolve(true);
//         } else {
//           return Promise.reject(
//             new Error(`error in pause player for path: ${path}`)
//           );
//         }
//       } catch (error) {
//         return Promise.reject(error);
//       }
//     } else {
//       return Promise.reject(
//         new Error('error in pausing player: mode is not static')
//       );
//     }
//   };

//   const startRecordingAction = async (args?: Partial<IStartRecording>) => {
//     if (mode === 'live') {
//       try {
//         const hasPermission = await checkHasAudioRecorderPermission();

//         if (hasPermission === PermissionStatus.granted) {
//           const start = await startRecording(args);
//           if (!isNil(start) && start) {
//             setRecorderState(RecorderState.recording);
//             return Promise.resolve(true);
//           } else {
//             return Promise.reject(new Error('error in start recording action'));
//           }
//         } else {
//           return Promise.reject(
//             new Error(
//               'error in start recording: audio recording permission is not granted'
//             )
//           );
//         }
//       } catch (err) {
//         return Promise.reject(err);
//       }
//     } else {
//       return Promise.reject(
//         new Error('error in start recording: mode is not live')
//       );
//     }
//   };

//   const stopRecordingAction = async () => {
//     if (mode === 'live') {
//       try {
//         const data = await stopRecording();
//         if (!isNil(data) && !isEmpty(data)) {
//           setWaveform([]);
//           const pathData = head(data);
//           if (!isNil(pathData)) {
//             setRecorderState(RecorderState.stopped);
//             return Promise.resolve(pathData);
//           } else {
//             return Promise.reject(
//               new Error(
//                 'error in stopping recording. can not get path of recording'
//               )
//             );
//           }
//         } else {
//           return Promise.reject(
//             new Error(
//               'error in stopping recording. can not get path of recording'
//             )
//           );
//         }
//       } catch (err) {
//         return Promise.reject(err);
//       }
//     } else {
//       return Promise.reject(
//         new Error('error in stop recording: mode is not live')
//       );
//     }
//   };

//   const pauseRecordingAction = async () => {
//     if (mode === 'live') {
//       try {
//         const pause = await pauseRecording();
//         if (!isNil(pause) && pause) {
//           setRecorderState(RecorderState.paused);
//           return Promise.resolve(pause);
//         } else {
//           return Promise.reject(new Error('Error in pausing recording audio'));
//         }
//       } catch (err) {
//         return Promise.reject(err);
//       }
//     } else {
//       return Promise.reject(
//         new Error('error in pause recording: mode is not live')
//       );
//     }
//   };

//   const resumeRecordingAction = async () => {
//     if (mode === 'live') {
//       try {
//         const hasPermission = await checkHasAudioRecorderPermission();
//         if (hasPermission === PermissionStatus.granted) {
//           const resume = await resumeRecording();
//           if (!isNil(resume)) {
//             setRecorderState(RecorderState.recording);
//             return Promise.resolve(resume);
//           } else {
//             return Promise.reject(new Error('Error in resume recording'));
//           }
//         } else {
//           return Promise.reject(
//             new Error(
//               'error in resume recording: audio recording permission is not granted'
//             )
//           );
//         }
//       } catch (err) {
//         return Promise.reject(err);
//       }
//     } else {
//       return Promise.reject(
//         new Error('error in resume recording: mode is not live')
//       );
//     }
//   };

//   useEffect(() => {
//     if (!isNil(viewLayout?.width)) {
//       const getNumberOfSamples = floor(
//         (viewLayout?.width ?? 0) / (candleWidth + candleSpace)
//       );

//       // when orientation changes, the layout needs to be recalculated
//       if (viewLayout?.x === 0 && viewLayout?.y === 0) {
//         isLayoutCalculated.current = false;
//       }

//       setNoOfSamples(getNumberOfSamples);
//       if (mode === 'static') {
//         getAudioWaveFormForPath(getNumberOfSamples);
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [viewLayout?.width, mode, candleWidth, candleSpace]);

//   const seekToPlayerAction = async () => {
//     if (!isNil(seekPosition)) {
//       if (mode === 'static') {
//         const seekAmount =
//           (seekPosition?.pageX - (viewLayout?.x ?? 0)) /
//           (viewLayout?.width ?? 1);
//         const clampedSeekAmount = clamp(seekAmount, 0, 1);

//         if (!panMoving) {
//           try {
//             await seekToPlayer({
//               playerKey: `PlayerFor${path}`,
//               progress: clampedSeekAmount * songDuration,
//             });
//           } catch (e) {
//             if (playerState === PlayerState.paused) {
//               // If the player is not prepared, triggering the stop will reset the player for next click. Fix blocked paused player after a call to `stopAllPlayers`
//               await stopPlayerAction(false);
//             }
//           }

//           if (playerState === PlayerState.playing) {
//             startPlayerAction();
//           }
//         }

//         setCurrentProgress(clampedSeekAmount * songDuration);
//       }
//     }
//   };

//   useEffect(() => {
//     seekToPlayerAction();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [seekPosition, panMoving, mode, songDuration]);

//   useEffect(() => {
//     const tracePlayerState = onDidFinishPlayingAudio(async data => {
//       if (data.playerKey === `PlayerFor${path}`) {
//         if (data.finishType === FinishMode.stop) {
//           stopPlayerAction();
//         } else if (data.finishType === FinishMode.pause) {
//           setPlayerState(PlayerState.paused);
//         }
//       }
//     });

//     const tracePlaybackValue = onCurrentDuration(data => {
//       if (data.playerKey === `PlayerFor${path}`) {
//         const currentAudioDuration = Number(data.currentDuration);

//         if (!isNaN(currentAudioDuration)) {
//           setCurrentProgress(currentAudioDuration);
//         } else {
//           setCurrentProgress(0);
//         }
//       }
//     });

//     const traceRecorderWaveformValue = onCurrentRecordingWaveformData(
//       result => {
//         if (mode === 'live') {
//           if (!isNil(result.currentDecibel)) {
//             setWaveform((previousWaveform: number[]) => {
//               // Add the new decibel to the waveform
//               const updatedWaveform: number[] = [
//                 ...previousWaveform,
//                 result.currentDecibel,
//               ];

//               // Limit the size of the waveform array to 'maxCandlesToRender'
//               return updatedWaveform.length > maxCandlesToRender
//                 ? updatedWaveform.slice(1)
//                 : updatedWaveform;
//             });
//             if (scrollRef.current) {
//               scrollRef.current.scrollToEnd({ animated: true });
//             }
//           }
//         }
//       }
//     );
//     return () => {
//       tracePlayerState.remove();
//       tracePlaybackValue.remove();
//       traceRecorderWaveformValue.remove();
//       markPlayerAsUnmounted();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     if (!isNil(onPlayerStateChange)) {
//       (onPlayerStateChange as Function)(playerState);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [playerState]);

//   useEffect(() => {
//     if (!isNil(onRecorderStateChange)) {
//       (onRecorderStateChange as Function)(recorderState);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [recorderState]);

//   useEffect(() => {
//     if (panMoving) {
//       if (playerState === PlayerState.playing) {
//         pausePlayerAction(false);
//         isAutoPaused.current = true;
//       }
//     } else {
//       if (playerState === PlayerState.paused && isAutoPaused.current) {
//         startPlayerAction();
//       }

//       isAutoPaused.current = false;
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [panMoving]);

//   const calculateLayout = (): void => {
//     viewRef.current?.measureInWindow((x, y, width, height) => {
//       setViewLayout({ x, y, width, height });
//       if (x !== 0 || y !== 0) {
//         // found the position of view in window
//         isLayoutCalculated.current = true;
//       }
//     });
//   };

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => {
//         if (!isLayoutCalculated.current) {
//           calculateLayout();
//         }

//         return true;
//       },
//       onMoveShouldSetPanResponder: () => true,
//       onPanResponderGrant: () => {
//         setPanMoving(true);
//         (onPanStateChange as Function)(true);
//       },
//       onPanResponderStart: () => {},
//       onPanResponderMove: event => {
//         setSeekPosition(event.nativeEvent);
//       },
//       onPanResponderEnd: () => {
//         (onPanStateChange as Function)(false);
//         setPanMoving(false);
//       },
//       onPanResponderRelease: e => {
//         setSeekPosition(e.nativeEvent);
//         (onPanStateChange as Function)(false);
//         setPanMoving(false);
//       },
//     })
//   ).current;

//   useEffect(() => {
//     if (!isNil(onCurrentProgressChange)) {
//       (onCurrentProgressChange as Function)(currentProgress, songDuration);
//     }
//   }, [currentProgress, songDuration, onCurrentProgressChange]);

//   /* Ensure that the audio player is released (or stopped) once the song's duration is determined,
//   especially if the audio is not playing immediately after loading */
//   useEffect(() => {
//     if (
//       songDuration !== 0 &&
//       mode === 'static' &&
//       isAudioPlaying.current !== true
//     ) {
//       isAudioPlaying.current = false;
//       stopPlayerAction(false);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [songDuration]);

//   useImperativeHandle(ref, () => ({
//     startPlayer: startPlayerAction,
//     stopPlayer: stopPlayerAction,
//     pausePlayer: pausePlayerAction,
//     resumePlayer: startPlayerAction,
//     startRecord: startRecordingAction,
//     pauseRecord: pauseRecordingAction,
//     stopRecord: stopRecordingAction,
//     resumeRecord: resumeRecordingAction,
//     currentState: mode === 'static' ? playerState : recorderState,
//     playerKey: path,
//   }));

//   return (
//     <View style={[styles.waveformContainer, containerStyle]}>
//       <View
//         ref={viewRef}
//         style={styles.waveformInnerContainer}
//         onLayout={calculateLayout}
//         {...(mode === 'static' ? panResponder.panHandlers : {})}>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
//           ref={scrollRef}
//           style={styles.scrollContainer}
//           scrollEnabled={mode === 'live'}>
//           {waveform?.map?.((amplitude, indexCandle) => (
//             <WaveformCandle
//               key={indexCandle}
//               index={indexCandle}
//               amplitude={amplitude}
//               parentViewLayout={viewLayout}
//               {...{
//                 candleWidth,
//                 candleSpace,
//                 noOfSamples,
//                 songDuration,
//                 currentProgress,
//                 waveColor,
//                 scrubColor,
//                 candleHeightScale,
//               }}
//             />
//           ))}
//         </ScrollView>
//       </View>
//     </View>
//   );
// });
