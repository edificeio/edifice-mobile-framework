import * as React from 'react';
import { Platform } from 'react-native';

import LottieView from 'lottie-react-native';
import VideoPlayer from 'react-native-media-console';
import {
  BufferConfig,
  BufferingStrategyType,
  OnBufferData,
  OnPlaybackStateChangedData,
  OnProgressData,
  VideoRef,
} from 'react-native-video';

import ANIMATION_AUDIO from 'ASSETS/animations/audio/disque.json';
import LoaderItem from '~/framework/components/carousel-multimedia/loader-item/component';
import { PlayerContext } from '~/framework/components/carousel-multimedia/screen';
import { isAudioContent } from '~/framework/util/media';

import styles from './styles';
import { PlayerItemProps } from './types';

const CONTROLS_TIMEOUT_DELAY = 60000;
const REWIND_TIME = 10;
const MEDIA_LOAD_TIMEOUT = 30000;
const ANDROID_BUFFER_CONFIG: BufferConfig = {
  backBufferDurationMs: 500,
  bufferForPlaybackAfterRebufferMs: 2000,
  bufferForPlaybackMs: 1500,
  cacheSizeMB: 100,
  maxBufferMs: 10000,
  minBufferMs: 2500,
};
const IOS_MAX_BUFFER_DURATION = 10;
const IOS_BUFFERING_DEBOUNCE = 500;
const ON_BUFFERING_SHOW_NAVBAR_TIMEOUT = 10000;

const PlayerItem = ({
  hideNavBar,
  isCurrentItem,
  isPlayerLoadTimeout,
  item,
  itemIndex,
  onInitialMediaLoad,
  setIsPlayerError,
  setIsPlayerLoadTimeout,
  showNavBar,
  source,
}: PlayerItemProps) => {
  const audioPosterRefs = React.useRef<Map<number, LottieView | null>>(new Map());
  const playerContextValue = React.useContext(PlayerContext);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isBuffering, setIsBuffering] = React.useState(false);
  const [paused, setPaused] = React.useState(() => {
    const savedState = playerContextValue.savedStates.get(itemIndex);
    // Start paused when there is a position to restore (otherwise content flashes back to the beginning before resuming to saved position)
    if (savedState?.position) return true;
    return savedState?.paused ?? true;
  });
  const videoRef = React.useRef<VideoRef>(null);
  const hasBeenReadyRef = React.useRef(false);
  const pausedRef = React.useRef(paused);
  const bufferingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const getAudioPosterRef = React.useCallback((idx: number) => {
    return (audioAnimationRef: LottieView | null) => {
      if (audioAnimationRef) {
        audioPosterRefs.current.set(idx, audioAnimationRef);
      } else {
        audioPosterRefs.current.delete(idx);
      }
    };
  }, []);

  const pause = React.useCallback(() => {
    showNavBar();
    pausedRef.current = true;
    setPaused(true);
    const animRef = audioPosterRefs.current.get(itemIndex);
    animRef?.pause();
  }, [itemIndex, showNavBar]);

  const onPlay = React.useCallback(() => {
    hideNavBar();
    pausedRef.current = false;
    setPaused(false);
    const animRef = audioPosterRefs.current.get(itemIndex);
    animRef?.resume();
    if (videoRef.current?.toggleControls) {
      videoRef.current.toggleControls();
    }
  }, [hideNavBar, itemIndex]);

  // Force pause because the video player prop 'repeat' doesn't work
  const onEnd = React.useCallback(() => {
    pause();
    if (videoRef.current?.toggleControls) {
      videoRef.current.toggleControls();
    }
  }, [pause]);

  const onPlayerError = React.useCallback(() => {
    setIsPlayerError(true);
  }, [setIsPlayerError]);

  const onProgress = React.useCallback(
    (data: OnProgressData) => {
      playerContextValue.savedStates.set(itemIndex, { paused, position: data.currentTime });
    },
    [itemIndex, paused, playerContextValue.savedStates],
  );

  // When the first video frame is ready
  const onReadyForDisplay = React.useCallback(() => {
    hasBeenReadyRef.current = true;
    setIsLoading(false);
    setIsBuffering(false);
  }, []);

  // Audio has no video frames so we fire onReadyForDisplay once it's loaded to switch from Loader to Player
  const onLoad = React.useCallback(() => {
    if (isAudioContent(item)) onReadyForDisplay();
    onInitialMediaLoad?.();
  }, [item, onInitialMediaLoad, onReadyForDisplay]);

  /**
   * Only works on Android
   * Renders the ActivityIndicator if the video/audio buffers AFTER the first load (isLoading ≠ isBuffering)
   */
  const onBuffer = React.useCallback(
    ({ isBuffering: buffering }: OnBufferData) => {
      if (buffering) {
        if (hasBeenReadyRef.current) {
          setIsBuffering(true);
          videoRef.current?.hideControls?.();
        }
      } else {
        onReadyForDisplay();
      }
    },
    [onReadyForDisplay],
  );

  const clearBufferingTimeout = React.useCallback(() => {
    if (bufferingTimeoutRef.current) {
      clearTimeout(bufferingTimeoutRef.current);
      bufferingTimeoutRef.current = null;
    }
  }, []);

  /**
   * iOS fallback for onBuffer, we infer a stall from the play state
   * when tapping an unbuffered zone on the seekbar
   */
  const onPlaybackStateChanged = React.useCallback(
    ({ isPlaying }: OnPlaybackStateChangedData) => {
      if (Platform.OS !== 'ios' || !hasBeenReadyRef.current) return;
      clearBufferingTimeout();
      if (isPlaying || pausedRef.current) {
        setIsBuffering(false);
      } else {
        bufferingTimeoutRef.current = setTimeout(() => {
          setIsBuffering(true);
          videoRef.current?.hideControls?.();
        }, IOS_BUFFERING_DEBOUNCE);
      }
    },
    [clearBufferingTimeout],
  );

  const renderLoader = React.useCallback(() => <LoaderItem />, []);

  // Ensure only one media plays at a time
  // When playing: sets context.pauseCurrentPlayingMedia to this player's pause function.
  // When paused: clears this player's pause function from context.
  // Cleanup: removes stale references on unmount
  // Other players call context.pauseCurrentPlayingMedia() to pause the current player before starting.
  React.useEffect(() => {
    if (!paused) {
      playerContextValue.pauseCurrentPlayingMedia = pause;
    } else if (playerContextValue.pauseCurrentPlayingMedia === pause) {
      playerContextValue.pauseCurrentPlayingMedia = undefined;
    }
    return () => {
      if (playerContextValue.pauseCurrentPlayingMedia === pause) {
        playerContextValue.pauseCurrentPlayingMedia = undefined;
      }
    };
  }, [paused, pause, playerContextValue]);

  React.useEffect(() => {
    if (isCurrentItem && videoRef.current?.showControls && !isLoading) {
      videoRef.current.showControls();
    }
  }, [isCurrentItem, isLoading]);

  React.useEffect(() => clearBufferingTimeout, [clearBufferingTimeout]);

  // If buffering is too long, bring the navbar back so the user isn't trapped in the carousel without an exit.
  React.useEffect(() => {
    if (!isBuffering) return undefined;
    const timeoutId = setTimeout(showNavBar, ON_BUFFERING_SHOW_NAVBAR_TIMEOUT);
    return () => clearTimeout(timeoutId);
  }, [isBuffering, showNavBar]);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (isLoading && !isPlayerLoadTimeout && !hasBeenReadyRef.current) {
      timeoutId = setTimeout(() => {
        setIsPlayerLoadTimeout(true);
      }, MEDIA_LOAD_TIMEOUT);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, isPlayerLoadTimeout, setIsPlayerLoadTimeout]);

  return (
    <>
      <VideoPlayer
        controlTimeoutDelay={CONTROLS_TIMEOUT_DELAY}
        disableBack
        disableFullscreen
        disableVolume
        onLoad={onLoad}
        onReadyForDisplay={onReadyForDisplay}
        onBuffer={onBuffer}
        onPlaybackStateChanged={onPlaybackStateChanged}
        onProgress={onProgress}
        onEnd={onEnd}
        onError={onPlayerError}
        onPause={pause}
        onPlay={onPlay}
        paused={paused}
        videoRef={videoRef as React.RefObject<VideoRef>}
        renderLoader={renderLoader}
        resizeMode="contain"
        rewindTime={REWIND_TIME}
        showDuration
        bufferingStrategy={BufferingStrategyType.DEPENDING_ON_MEMORY}
        source={{
          ...source,
          bufferConfig: ANDROID_BUFFER_CONFIG,
        }}
        preferredForwardBufferDuration={IOS_MAX_BUFFER_DURATION}
        {...(isAudioContent(item)
          ? {
              posterElement: (
                <LottieView ref={getAudioPosterRef(itemIndex)} source={ANIMATION_AUDIO} style={styles.poster} speed={0.5} />
              ),
            }
          : {})}
      />
      {isLoading && <LoaderItem />}
      {isBuffering && <LoaderItem transparent />}
    </>
  );
};

export default React.memo(PlayerItem);
