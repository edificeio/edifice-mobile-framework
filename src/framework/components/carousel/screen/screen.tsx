import * as React from 'react';
import { Platform, StatusBar as RNStatusBar, useWindowDimensions, View } from 'react-native';

import { OrientationLocker } from 'react-native-orientation-locker';
import { useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Carousel, type CarouselPanGesture, type CarouselRef, type CarouselRenderItemInfo } from 'react-native-reanimated-carousel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { I18n } from '~/app/i18n';
import { NavigationRootScreenProps } from '~/app/navigation/types';
import CarouselItem from '~/framework/components/carousel/components/carousel-item/component';
import CarouselPagination from '~/framework/components/carousel/components/pagination/component';
import { PAGINATION_COMPONENT_HEIGHT } from '~/framework/components/carousel/components/pagination/styles';
import { PdfContext, PlayerContext } from '~/framework/components/carousel/context';
import { useCarouselFileHandler } from '~/framework/components/carousel/hooks/use-carousel-file-handler';
import { useCarouselOrientation } from '~/framework/components/carousel/hooks/use-carousel-orientation';
import { useTogglePagination } from '~/framework/components/carousel/hooks/use-toggle-pagination';
import { getSignedMediaSource } from '~/framework/components/carousel/utils';
import { UI_SIZES } from '~/framework/components/constants';
import { FileMedia, isPlayableMedia } from '~/framework/modules/media';

import { CarouselScreenOptions, getNavActions } from './navbar';
import styles from './styles';

import {
  PAGINATION_ANIMATION_DURATION,
  PAGINATION_ANIMATION_OFFSET,
  PAGINATION_ANIMATION_START_INDEX_DELAY,
} from '~/framework/components/carousel/constants';

/**
 * Useful things to know about this carousel screen:
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
const CAROUSEL_WINDOW_SIZE = 6;
const SWIPE_GESTURE_DISABLE_AREA_FILLER = UI_SIZES.spacing.big;
const SWIPE_GESTURE_DISABLE_AREA = PAGINATION_COMPONENT_HEIGHT + SWIPE_GESTURE_DISABLE_AREA_FILLER;

const CarouselScreenWithProviders = (props: NavigationRootScreenProps<'media/carousel'>) => {
  const playerContextValue = React.useRef({ savedStates: new Map<number, { position: number; paused: boolean }>() });
  return (
    <PlayerContext value={playerContextValue.current}>
      <PdfContext value={{}}>
        <CarouselScreen {...props} />
      </PdfContext>
    </PlayerContext>
  );
};

const CarouselScreen = ({ navigation, route }: NavigationRootScreenProps<'media/carousel'>) => {
  const media = React.useMemo<FileMedia[]>(() => route.params.media ?? [], [route.params.media]);
  const { startIndex = 0 } = route.params;
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);
  const [erroredIndexes, setErroredIndexes] = React.useState<Set<number>>(() => new Set());
  const setHasMediaError = React.useCallback((index: number) => {
    setErroredIndexes(prev => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);
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
  const carouselRef = React.useRef<CarouselRef>(null);
  const playerContextValue = React.useContext(PlayerContext);
  const pdfContextValue = React.useContext(PdfContext);
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const statusbarHeight = RNStatusBar.currentHeight ?? 0;
  const androidStatusBarHeight = isAndroid ? statusbarHeight : 0;

  const configurePanGesture = React.useCallback((panGesture: CarouselPanGesture) => {
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
      height: windowHeight - (isAndroid ? insets.top : 0) - insets.bottom,
      width: Math.ceil(windowWidth),
    }),
    [insets.bottom, insets.top, windowHeight, windowWidth],
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

  const signedSources = React.useMemo(() => media.map(getSignedMediaSource), [media]);

  const renderItem = React.useCallback(
    ({ index, item }: CarouselRenderItemInfo<FileMedia>) => (
      <CarouselItem
        containerHeight={carouselDimensions.height}
        containerWidth={carouselDimensions.width}
        hideNavBar={hideNavBar}
        index={index}
        isCurrentItem={index === currentIndex}
        isNavBarVisible={isNavBarVisible}
        item={item}
        itemSource={signedSources[index]}
        onInitialAVMediaLoad={index === startIndex ? onInitialAVMediaLoad : undefined}
        setHasMediaError={setHasMediaError}
        setIsCarouselSwipeEnabled={setIsCarouselSwipeEnabled}
        showNavBar={showNavBar}
        toggleNavBarVisibility={toggleNavBarVisibility}
      />
    ),
    [
      carouselDimensions,
      currentIndex,
      hideNavBar,
      isNavBarVisible,
      onInitialAVMediaLoad,
      setHasMediaError,
      showNavBar,
      signedSources,
      startIndex,
      toggleNavBarVisibility,
    ],
  );

  React.useEffect(() => {
    const isLandscape = orientation !== 'PORTRAIT';

    if (isNavBarVisible) {
      navigation.setOptions({
        ...CarouselScreenOptions({ navigation, route }),
        ...getNavActions({ isError: erroredIndexes.has(currentIndex), media: media[currentIndex], navigation, onShare, route }),
        headerShown: isAndroid ? true : undefined,
        statusBarHidden: isLandscape,
        title:
          media.length !== 1
            ? I18n.get('carousel-counter', { current: currentIndex + 1, total: media.length })
            : (route.params.title ?? ''),
      });
    } else {
      navigation.setOptions({
        headerBlurEffect: undefined,
        headerLeft: () => <React.Fragment />,
        headerRight: undefined,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'transparent' },
        statusBarHidden: isLandscape,
        title: '',
        unstable_headerLeftItems: () => [],
        unstable_headerRightItems: undefined,
      });
    }
  }, [isNavBarVisible, media.length, currentIndex, erroredIndexes, orientation, navigation, media, onShare, route]);

  React.useEffect(() => {
    mediaLengthShared.value = media.length;
  }, [media.length, mediaLengthShared]);

  return (
    <View style={containerStyle}>
      <OrientationLocker orientation={'UNLOCK'} onChange={onOrientationChange} />
      <Carousel
        style={{
          height: carouselDimensions.height,
          width: carouselDimensions.width,
        }}
        data={media}
        defaultIndex={currentIndex}
        scrollEnabled={media.length > 1 && isCarouselSwipeEnabled}
        loop={media.length > 2}
        onConfigurePanGesture={configurePanGesture}
        progress={paginationProgress}
        onSnapToItem={onSnapToItem}
        renderItem={renderItem}
        ref={carouselRef}
        renderWindowSize={media.length === 1 ? 1 : Math.min(CAROUSEL_WINDOW_SIZE, media.length - 1)}
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

export default CarouselScreenWithProviders;
