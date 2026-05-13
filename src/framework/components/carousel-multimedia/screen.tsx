import * as React from 'react';
import { createContext } from 'react';
import { Platform, StatusBar as RNStatusBar, useWindowDimensions, View } from 'react-native';

import { PanGesture } from 'react-native-gesture-handler';
import { OrientationLocker } from 'react-native-orientation-locker';
import { useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { CarouselRenderItemInfo } from 'react-native-reanimated-carousel/lib/typescript/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { I18n } from '~/app/i18n';
import { ModuleScreenProps } from '~/app/navigation/types';
import { UI_SIZES } from '~/framework/components/constants';
import { FileMedia, isPlayableMedia } from '~/framework/util/media';

import CarouselItem from './component';
import { useCarouselFileHandler, useCarouselOrientation, useTogglePagination } from './hooks';
import { MultimediaCarouselScreenOptions, NavbarButtons } from './navbar';
import CarouselPagination from './pagination/component';
import { PAGINATION_COMPONENT_HEIGHT } from './pagination/styles';
import styles from './styles';
import { getSignedMediaSource } from './util';

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
const SWIPE_GESTURE_DISABLE_AREA_FILLER = UI_SIZES.spacing.big;
const SWIPE_GESTURE_DISABLE_AREA = PAGINATION_COMPONENT_HEIGHT + SWIPE_GESTURE_DISABLE_AREA_FILLER;

export const PlayerContext = createContext<{
  pauseCurrentPlayingMedia?: () => void;
  savedStates: Map<number, { position: number; paused: boolean }>;
}>({ savedStates: new Map() });
export const PdfContext = createContext<{ disableCarouselSwipe?: () => void; setResetComponent?: () => void }>({});

export default (props: ModuleScreenProps<'media/carousel'>) => {
  const playerContextValue = React.useRef({ savedStates: new Map<number, { position: number; paused: boolean }>() });
  return (
    <PlayerContext value={playerContextValue.current}>
      <PdfContext value={{}}>
        <CarouselScreen {...props} />
      </PdfContext>
    </PlayerContext>
  );
};

const CarouselScreen = ({ navigation, route }: ModuleScreenProps<'media/carousel'>) => {
  const media = React.useMemo<FileMedia[]>(() => route.params.media ?? [], [route.params.media]);
  const startIndex = route.params.startIndex ?? 0;
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);
  const [hasMediaError, setHasMediaError] = React.useState(false);
  const [isCarouselSwipeEnabled, setIsCarouselSwipeEnabled] = React.useState(true);
  const [isInitialAVMediaLoaded, setIsInitialAVMediaLoaded] = React.useState(false);
  const [isNavBarVisible, setIsNavBarVisible] = React.useState(true);
  const [isPaginationVisible, setIsPaginationVisible] = React.useState(true);
  const paginationProgress = useSharedValue<number>(0);
  const paginationTranslateY = useSharedValue(0);
  const mediaLengthShared = useSharedValue(media.length);
  const containerWidthShared = useSharedValue(0);
  const { onOrientationChange, orientation } = useCarouselOrientation();
  const { onShare } = useCarouselFileHandler(media[currentIndex]);
  const togglePaginationComponent = useTogglePagination(media, paginationTranslateY, setIsPaginationVisible);
  const carouselRef = React.useRef<ICarouselInstance>(null);
  const playerContextValue = React.useContext(PlayerContext);
  const pdfContextValue = React.useContext(PdfContext);
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const statusbarHeight = RNStatusBar.currentHeight ?? 0;
  const androidStatusBarHeight = isAndroid ? statusbarHeight : 0;

  const configurePanGesture = React.useCallback((panGesture: PanGesture) => {
    if (isAndroid) {
      panGesture.minDistance(50).failOffsetY([-20, 20]).activeOffsetX([-30, 30]);
    }
    panGesture.hitSlop({ bottom: -SWIPE_GESTURE_DISABLE_AREA });
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

  const carouselDimensions = React.useMemo(
    () => ({
      height: windowHeight - (isAndroid ? insets.top : 0) - (orientation === 'PORTRAIT' ? insets.bottom : 0),
      width: Math.ceil(windowWidth),
    }),
    [insets.bottom, insets.top, windowHeight, windowWidth, orientation],
  );

  React.useEffect(() => {
    containerWidthShared.value = carouselDimensions.width;
  }, [carouselDimensions.width, containerWidthShared]);

  const containerStyle = React.useMemo(
    () => [
      styles.container,
      {
        height: carouselDimensions.height,
        paddingBottom: isAndroid ? (insets.bottom ?? 0) : 0,
        paddingTop: isAndroid ? (insets.top ?? 0) : 0,
        width: carouselDimensions.width + androidStatusBarHeight,
      },
    ],
    [androidStatusBarHeight, carouselDimensions.height, carouselDimensions.width, insets.bottom, insets.top],
  );

  const carouselItemHeight = React.useMemo(
    () => carouselDimensions.height - (insets.bottom ?? 0),
    [carouselDimensions.height, insets.bottom],
  );

  React.useEffect(() => {
    const isLandscape = orientation !== 'PORTRAIT';

    if (isNavBarVisible) {
      navigation.setOptions({
        // ...MultimediaCarouselScreenOptions({ navigation, route }),
        headerRight: () => <NavbarButtons disabled={hasMediaError} media={media[currentIndex]} onShare={onShare} />,
        headerShown: isAndroid ? true : undefined,
        statusBarHidden: isLandscape,
        title:
          media.length !== 1
            ? I18n.get('carousel-counter', { current: currentIndex + 1, total: media.length })
            : route.params.title,
      });
    } else {
      navigation.setOptions({
        headerBlurEffect: undefined,
        headerLeft: undefined,
        headerRight: undefined,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'transparent' },
        statusBarHidden: isLandscape,
        title: '',
      });
    }
  }, [isNavBarVisible, media.length, currentIndex, hasMediaError, orientation, navigation, media, route.params.title, onShare]);

  React.useEffect(() => {
    mediaLengthShared.value = media.length;
  }, [media.length, mediaLengthShared]);

  return (
    <View style={containerStyle}>
      <OrientationLocker orientation={'UNLOCK'} onChange={onOrientationChange} />
      <Carousel
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
              containerHeight={carouselItemHeight}
              containerWidth={carouselDimensions.width}
              currentIndex={currentIndex}
              hideNavBar={hideNavBar}
              info={info}
              isNavBarVisible={isNavBarVisible}
              itemSource={source}
              onInitialAVMediaLoad={isInitialItem ? onInitialAVMediaLoad : undefined}
              setHasMediaError={setHasMediaError}
              setIsCarouselSwipeEnabled={setIsCarouselSwipeEnabled}
              showNavBar={showNavBar}
              toggleNavBarVisibility={toggleNavBarVisibility}
            />
          );
        }}
        ref={carouselRef}
        windowSize={media.length === 1 ? 1 : Math.min(CAROUSEL_WINDOW_SIZE, media.length - 1)}
      />
      <CarouselPagination
        bottomInset={isAndroid ? (insets.bottom ?? 0) : 0}
        carouselRef={carouselRef}
        containerWidth={carouselDimensions.width}
        containerWidthShared={containerWidthShared}
        media={media}
        mediaLengthShared={mediaLengthShared}
        isInitialAVMediaLoaded={isInitialAVMediaLoaded}
        isNavBarVisible={isNavBarVisible}
        isPaginationVisible={isPaginationVisible}
        paginationProgress={paginationProgress}
        paginationTranslateY={paginationTranslateY}
        startIndex={startIndex}
      />
    </View>
  );
};
