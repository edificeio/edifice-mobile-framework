import * as React from 'react';
import { createContext } from 'react';
import { Platform } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PanGesture } from 'react-native-gesture-handler';
import { OrientationLocker, OrientationType } from 'react-native-orientation-locker';
import { useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { CarouselRenderItemInfo } from 'react-native-reanimated-carousel/lib/typescript/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CarouselItem from './component';
import { useCarouselFileHandler, useCarouselOrientation, useTogglePagination } from './hooks';
import { computeNavBar, NavbarButtons } from './navbar';
import CarouselPagination from './pagination/component';
import styles, { SCREEN_HEIGHT, SCREEN_WIDTH } from './styles';
import { getSignedMediaSource } from './util';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import StatusBar from '~/framework/components/status-bar';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarTitle } from '~/framework/navigation/navBar';
import { FileMedia, isPlayableMedia } from '~/framework/util/media';

/**
 * Useful things to know about this multimedia carousel screen:
 *
 * The react-native-reanimated-carousel library creates duplicate components with the same indexes
 * This means, for a given item in the carousel, in some cases the lib can create up to 2 components with the same index and item source, but different internal states (zoom and loading state for instance).
 * That is why we use contexts to share and reset these internal states, and also why we need to disable looping when there are only 2 items in the carrousel.
 *
 * For a carousel with a large array of media (>=20), we need to use the prop windowSize that reduces the calculation of the swipe animation
 * However, windowSize used alone causes bugs on orientation changes (portrait / landscape) on the Player and Pdf components (that come from 3rd party libraries)
 * WindowSize doesn't take orientation changes into account, so Player and Pdf items end up being rendered outside of the viewport.
 * That is why we set a key={orientation} on the Carousel component, and handle the playing state of the Player in its PlayerContext.
 */

const isAndroid = Platform.OS === 'android';
export const PAGINATION_ANIMATION_DURATION = 300;
export const PAGINATION_ANIMATION_OFFSET = 200;
const PAGINATION_ANIMATION_START_INDEX_DELAY = 1000;
const CAROUSEL_WINDOW_SIZE = 6;

export const PlayerContext = createContext<{
  pauseCurrentPlayingMedia?: () => void;
  savedStates: Map<number, { position: number; paused: boolean }>;
}>({ savedStates: new Map() });
export const PdfContext = createContext<{ disableCarouselSwipe?: () => void; setResetComponent?: () => void }>({});

export default (props: NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.CarouselMultimedia>) => {
  const playerContextValue = React.useRef({ savedStates: new Map<number, { position: number; paused: boolean }>() });
  return (
    <PlayerContext value={playerContextValue.current}>
      <PdfContext value={{}}>
        <CarouselScreen {...props} />
      </PdfContext>
    </PlayerContext>
  );
};

const CarouselScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.CarouselMultimedia>) => {
  const media = React.useMemo<FileMedia[]>(() => route.params.media ?? [], [route.params.media]);
  const startIndex = route.params.startIndex ?? 0;
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);
  const [isCarouselSwipeEnabled, setIsCarouselSwipeEnabled] = React.useState(true);
  const [isInitialAVMediaLoaded, setIsInitialAVMediaLoaded] = React.useState(false);
  const [isNavBarVisible, setIsNavBarVisible] = React.useState(true);
  const [isPaginationVisible, setIsPaginationVisible] = React.useState(true);
  const paginationProgress = useSharedValue<number>(0);
  const paginationTranslateY = useSharedValue(0);
  const mediaLengthShared = useSharedValue(media.length);
  const { onOrientationChange, orientation, orientationShared } = useCarouselOrientation();
  const { onSave, onShare } = useCarouselFileHandler(media[currentIndex]);
  const togglePaginationComponent = useTogglePagination(media, paginationTranslateY, setIsPaginationVisible);
  const carouselRef = React.useRef<ICarouselInstance>(null);
  const playerContextValue = React.useContext(PlayerContext);
  const pdfContextValue = React.useContext(PdfContext);
  const insets = useSafeAreaInsets();

  const isPortrait = React.useMemo(() => orientation === OrientationType.PORTRAIT, [orientation]);

  const isCurrentMediaUnknown = React.useMemo(() => {
    return !media[currentIndex]?.src;
  }, [currentIndex, media]);

  const configurePanGesture = React.useCallback((panGesture: PanGesture) => {
    if (isAndroid) {
      panGesture.minDistance(50).failOffsetY([-20, 20]).activeOffsetX([-30, 30]);
    }
  }, []);

  const hideNavBar = React.useCallback(() => {
    setIsNavBarVisible(false);
  }, []);

  const showNavBar = React.useCallback(() => {
    setIsNavBarVisible(true);
  }, []);

  const toggleNavBarVisibility = React.useCallback(() => {
    setIsNavBarVisible(prev => !prev);
  }, []);

  const onSnapToItem = React.useCallback(
    (index: number) => {
      playerContextValue.pauseCurrentPlayingMedia?.();
      if (pdfContextValue.disableCarouselSwipe) {
        pdfContextValue.disableCarouselSwipe();
        pdfContextValue.disableCarouselSwipe = undefined;
      }
      const previousIndex = currentIndex;
      setCurrentIndex(index);
      togglePaginationComponent(index, previousIndex);
      showNavBar();
    },

    [currentIndex, playerContextValue, pdfContextValue, showNavBar, togglePaginationComponent],
  );

  const onInitialAVMediaLoad = React.useCallback(() => {
    if (isPlayableMedia(media[startIndex]) && !isInitialAVMediaLoaded) {
      paginationTranslateY.value = 0;
      paginationTranslateY.value = withDelay(
        PAGINATION_ANIMATION_START_INDEX_DELAY,
        withTiming(PAGINATION_ANIMATION_OFFSET, { duration: PAGINATION_ANIMATION_DURATION }),
      );
      setIsPaginationVisible(true);
      setIsInitialAVMediaLoaded(true);
    }
  }, [isInitialAVMediaLoaded, media, paginationTranslateY, startIndex]);

  const containerStyle = React.useMemo(
    () => [
      styles.container,
      {
        height: isPortrait ? SCREEN_HEIGHT : SCREEN_WIDTH,
        paddingBottom: isPortrait ? insets.bottom : 0,
        paddingTop: isPortrait ? insets.top : 0,
        width: isPortrait ? SCREEN_WIDTH : SCREEN_HEIGHT,
      },
    ],

    [insets.bottom, insets.top, isPortrait],
  );

  const carouselDimensions = React.useMemo(
    () => ({
      height: isPortrait ? SCREEN_HEIGHT - insets.top - insets.bottom : SCREEN_WIDTH,
      width: isPortrait ? SCREEN_WIDTH : SCREEN_HEIGHT,
    }),
    [isPortrait, insets.top, insets.bottom],
  );

  React.useEffect(() => {
    if (isNavBarVisible) {
      navigation.setOptions({
        ...computeNavBar({ navigation, route }),
        headerRight: () => <NavbarButtons disabled={isCurrentMediaUnknown} onSave={onSave} onShare={onShare} />,
        headerShown: isAndroid ? true : undefined,
        headerTitle:
          media.length !== 1
            ? navBarTitle(I18n.get('carousel-counter', { current: currentIndex + 1, total: media.length }), styles.title)
            : '',
      });
    } else {
      navigation.setOptions({
        headerBlurEffect: undefined,
        headerLeft: undefined,
        headerRight: undefined,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'transparent' },
        headerTitle: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavBarVisible, media.length, currentIndex, isCurrentMediaUnknown]);

  React.useEffect(() => {
    mediaLengthShared.value = media.length;
  }, [media.length, mediaLengthShared]);

  return (
    <PageView style={containerStyle} showNetworkBar={false} showToast={false}>
      <StatusBar type="dark" />
      <OrientationLocker orientation={'UNLOCK'} onChange={onOrientationChange} />
      <Carousel
        key={orientation}
        height={carouselDimensions.height}
        width={carouselDimensions.width}
        data={media}
        defaultIndex={currentIndex}
        enabled={media.length > 1 && isCarouselSwipeEnabled}
        loop={media.length > 2}
        onConfigurePanGesture={configurePanGesture}
        onProgressChange={paginationProgress}
        onSnapToItem={onSnapToItem}
        renderItem={(info: CarouselRenderItemInfo<FileMedia>) => {
          const source = getSignedMediaSource(info.item);
          const isInitialItem = info.index === startIndex;

          return (
            <CarouselItem
              containerHeight={carouselDimensions.height}
              containerWidth={carouselDimensions.width}
              currentIndex={currentIndex}
              hideNavBar={hideNavBar}
              info={info}
              itemSource={source}
              isCurrentMediaUnknown={isCurrentMediaUnknown}
              isNavBarVisible={isNavBarVisible}
              onInitialAVMediaLoad={isInitialItem ? onInitialAVMediaLoad : undefined}
              setIsCarouselSwipeEnabled={setIsCarouselSwipeEnabled}
              showNavBar={showNavBar}
              toggleNavBarVisibility={toggleNavBarVisibility}
            />
          );
        }}
        ref={carouselRef}
        windowSize={Math.min(CAROUSEL_WINDOW_SIZE, media.length - 1)}
      />
      <CarouselPagination
        media={media}
        isNavBarVisible={isNavBarVisible}
        isPaginationVisible={isPaginationVisible}
        isInitialAVMediaLoaded={isInitialAVMediaLoaded}
        startIndex={startIndex}
        paginationProgress={paginationProgress}
        paginationTranslateY={paginationTranslateY}
        orientationShared={orientationShared}
        mediaLengthShared={mediaLengthShared}
        carouselRef={carouselRef}
      />
    </PageView>
  );
};
