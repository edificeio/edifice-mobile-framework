import * as React from 'react';

import ANIMATION_AUDIO from 'ASSETS/animations/audio/disque.json';
import LottieView from 'lottie-react-native';
import VideoPlayer from 'react-native-media-console';
import { VideoRef } from 'react-native-video';

import styles from './styles';
import { PlayerItemProps } from './types';

import LoaderItem from '~/framework/components/carousel-multimedia/loader-item/component';
import { PlayerContext } from '~/framework/components/carousel-multimedia/screen';
import { isAudioContent } from '~/framework/util/media';

const CONTROLS_TIMEOUT_DELAY = 60000;

const PlayerItem = ({ hideNavBar, index, isCurrentItem, item, onInitialMediaLoad, showNavBar, source }: PlayerItemProps) => {
  const audioPosterRefs = React.useRef<Map<number, LottieView | null>>(new Map());
  const playerContextValue = React.useContext(PlayerContext);
  const [isMediaLoading, setIsMediaLoading] = React.useState(true);
  const [paused, setPaused] = React.useState(true);
  const videoRef = React.useRef<VideoRef>(null);

  // Fonction helper pour obtenir la ref d'un index
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
    playerContextValue.pauseCurrentPlayingMedia = undefined;
    const animRef = audioPosterRefs.current.get(index);
    animRef?.pause();
  }, [index, playerContextValue]);

  const onPlay = React.useCallback(() => {
    setPaused(false);
    playerContextValue.pauseCurrentPlayingMedia = pause;
    const animRef = audioPosterRefs.current.get(index);
    animRef?.resume();
    if (videoRef.current?.toggleControls) {
      videoRef.current.toggleControls();
    }
  }, [index, pause, playerContextValue]);

  // force pause because the video player prop 'repeat' doesn't work
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

  React.useEffect(() => {
    if (isCurrentItem && videoRef.current?.toggleControls) {
      videoRef.current.toggleControls();
    }
  }, [isCurrentItem]);

  return (
    <>
      <VideoPlayer
        controlTimeoutDelay={CONTROLS_TIMEOUT_DELAY}
        disableBack
        disableFullscreen
        disableVolume
        onHideControls={isCurrentItem ? hideNavBar : undefined}
        onShowControls={isCurrentItem ? showNavBar : undefined}
        onLoad={onLoad}
        onEnd={onEnd}
        onPause={pause}
        onPlay={onPlay}
        paused={paused}
        videoRef={videoRef as React.RefObject<VideoRef>}
        resizeMode="contain"
        rewindTime={10}
        source={source}
        {...(isAudioContent(item)
          ? {
              posterElement: (
                <LottieView ref={getAudioPosterRef(index)} source={ANIMATION_AUDIO} style={styles.poster} speed={0.5} />
              ),
            }
          : {})}
      />
      {isMediaLoading && <LoaderItem />}
    </>
  );
};

export default PlayerItem;
