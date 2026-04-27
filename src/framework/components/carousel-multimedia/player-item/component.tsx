import * as React from 'react';

import ANIMATION_AUDIO from 'ASSETS/animations/audio/disque.json';
import LottieView from 'lottie-react-native';
import VideoPlayer from 'react-native-media-console';
import { OnProgressData, VideoRef } from 'react-native-video';

import styles from './styles';
import { PlayerItemProps } from './types';

import LoaderItem from '~/framework/components/carousel-multimedia/loader-item/component';
import { PlayerContext } from '~/framework/components/carousel-multimedia/screen';
import { isAudioContent } from '~/framework/util/media';

const CONTROLS_TIMEOUT_DELAY = 60000;

const PlayerItem = ({ hideNavBar, isCurrentItem, item, itemIndex, onInitialMediaLoad, showNavBar, source }: PlayerItemProps) => {
  const audioPosterRefs = React.useRef<Map<number, LottieView | null>>(new Map());
  const playerContextValue = React.useContext(PlayerContext);
  const [isMediaLoading, setIsMediaLoading] = React.useState(true);
  const [paused, setPaused] = React.useState(() => {
    const savedState = playerContextValue.savedStates.get(itemIndex);
    // Start paused when there is a position to restore (otherwise content flashes back to the beginning before resuming to saved position)
    if (savedState?.position) return true;
    return savedState?.paused ?? true;
  });
  const videoRef = React.useRef<VideoRef>(null);

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
    setPaused(true);
    const animRef = audioPosterRefs.current.get(itemIndex);
    animRef?.pause();
  }, [itemIndex]);

  const onPlay = React.useCallback(() => {
    hideNavBar();
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

  const onLoad = React.useCallback(() => {
    setIsMediaLoading(false);
    onInitialMediaLoad?.();
  }, [onInitialMediaLoad]);

  const onProgress = React.useCallback(
    (data: OnProgressData) => {
      playerContextValue.savedStates.set(itemIndex, { paused, position: data.currentTime });
    },
    [itemIndex, paused, playerContextValue.savedStates],
  );

  // Ensure only one media plays at a time
  // When playing: sets context.pauseCurrentPlayingMedia to this player's pause function.
  // When paused: clears this player's pause function from context.
  // Cleanup: removes stale references on unmount (handles carousel remounts on orientation change).
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
    if (isCurrentItem && videoRef.current?.showControls) {
      videoRef.current.showControls();
    }
  }, [isCurrentItem]);

  return (
    <>
      <VideoPlayer
        controlTimeoutDelay={CONTROLS_TIMEOUT_DELAY}
        disableBack
        disableFullscreen
        disableVolume
        onShowControls={isCurrentItem ? showNavBar : undefined}
        onLoad={onLoad}
        onProgress={onProgress}
        onEnd={onEnd}
        onPause={pause}
        onPlay={onPlay}
        paused={paused}
        videoRef={videoRef as React.RefObject<VideoRef>}
        resizeMode="contain"
        rewindTime={10}
        showDuration
        source={source}
        {...(isAudioContent(item)
          ? {
              posterElement: (
                <LottieView ref={getAudioPosterRef(itemIndex)} source={ANIMATION_AUDIO} style={styles.poster} speed={0.5} />
              ),
            }
          : {})}
      />
      {isMediaLoading && <LoaderItem />}
    </>
  );
};

export default React.memo(PlayerItem);
