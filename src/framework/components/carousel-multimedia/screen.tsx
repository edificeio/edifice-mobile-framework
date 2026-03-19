import * as React from 'react';
import { createContext } from 'react';
import { Platform, View } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PanGesture } from 'react-native-gesture-handler';
import Orientation, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  OrientationLocker,
  OrientationLockerProps,
  OrientationType,
  PORTRAIT,
} from 'react-native-orientation-locker';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import { CarouselRenderItemInfo } from 'react-native-reanimated-carousel/lib/typescript/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CarouselItem } from './component';
import { useCarouselFileHandler } from './hooks';
import { computeNavBar, NavbarButtons } from './navbar';
import PaginationBackground from './pagination-background/component';
import PaginationItem from './pagination-item/component';
import styles, { ACTIVE_ITEM_WIDTH, INACTIVE_ITEM_WIDTH, ITEM_GAP, SCREEN_HEIGHT, SCREEN_WIDTH } from './styles';
import { getSignedMediaSource, getSignedPosterSource } from './util';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import StatusBar from '~/framework/components/status-bar';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarTitle } from '~/framework/navigation/navBar';
import { FileMedia, isImageContent, isPlayableMedia } from '~/framework/util/media';

/**
 * The react-native-reanimated-carousel library creates duplicate components with the same indexes
 * This means, for a given item in the carousel, in some cases the lib can create up to 2 components with the same index and item source, but different internal states (zoom and loading state for instance).
 * That is why we use contexts to share and reset these internal states, and also why we need to disable looping when there are only 2 items in the carrousel.
 */

const isAndroid = Platform.OS === 'android';
const PAGINATION_ANIMATION_DURATION = 300;
const PAGINATION_ANIMATION_DELAY = 300;
const PAGINATION_ANIMATION_START_INDEX_DELAY = 1000;
const PAGINATION_ANIMATION_OFFSET = 200;

export const PlayerContext = createContext<{ pauseCurrentPlayingMedia?: () => void }>({});
export const PdfContext = createContext<{ disableCarouselSwipe?: () => void; setResetComponent?: () => void }>({});

export default (props: NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.CarouselMultimedia>) => {
  return (
    <PlayerContext value={{}}>
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
  const startIndex = route.params.startIndex ?? 0;
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);
  const [isCarouselSwipeEnabled, setIsCarouselSwipeEnabled] = React.useState(true);
  const [isNavBarVisible, setIsNavBarVisible] = React.useState(true);
  const [isPaginationVisible, setIsPaginationVisible] = React.useState(true);
  const [orientation, setOrientation] = React.useState<OrientationLockerProps['orientation']>(PORTRAIT);
  const [isInitialAVMediaLoaded, setIsInitialAVMediaLoaded] = React.useState(false);
  const orientationShared = useSharedValue<OrientationLockerProps['orientation']>(PORTRAIT);
  const paginationProgress = useSharedValue<number>(0);
  const paginationTranslateY = useSharedValue(0);
  const isPortrait = React.useMemo(() => orientation === OrientationType.PORTRAIT, [orientation]);
  const media = React.useMemo<FileMedia[]>(() => route.params.media ?? [], [route.params.media]);
  const carouselRef = React.useRef<ICarouselInstance>(null);
  const playerContextValue = React.useContext(PlayerContext);
  const pdfContextValue = React.useContext(PdfContext);
  const { onSave, onShare } = useCarouselFileHandler(media[currentIndex]);
  const insets = useSafeAreaInsets();

  const isCurrentMediaUnknown = React.useMemo(() => {
    return !media[currentIndex]?.src;
  }, [currentIndex, media]);

  const canShowPagination = React.useMemo(() => {
    return (
      media.length > 1 && isNavBarVisible && isPaginationVisible && (!isPlayableMedia(media[startIndex]) || isInitialAVMediaLoaded)
    );
  }, [media, isNavBarVisible, isPaginationVisible, startIndex, isInitialAVMediaLoaded]);

  const renderPaginationItem = React.useCallback(
    (item: FileMedia, index: number) => {
      const thumbnailSrc =
        item.mime && isImageContent(item) && item.src
          ? getSignedPosterSource(item.src)
          : item.mime && isPlayableMedia(item) && item.poster
            ? getSignedPosterSource(item.poster)
            : undefined;

      return <PaginationItem item={item} thumbnailSrc={thumbnailSrc} index={index} paginationProgress={paginationProgress} />;
    },
    [paginationProgress],
  );

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

  const togglePaginationComponent = React.useCallback(
    (index: number, previousIndex: number) => {
      const currentIsPlayable = isPlayableMedia(media[index]);
      const previousWasPlayable = isPlayableMedia(media[previousIndex]);

      if (currentIsPlayable) {
        if (previousWasPlayable) {
          // playable to playable
          paginationTranslateY.value = PAGINATION_ANIMATION_OFFSET;
          setIsPaginationVisible(false);
        } else {
          // non playable to playable
          paginationTranslateY.value = 0;
          paginationTranslateY.value = withDelay(
            PAGINATION_ANIMATION_DELAY,
            withTiming(PAGINATION_ANIMATION_OFFSET, { duration: PAGINATION_ANIMATION_DURATION }),
          );
          setIsPaginationVisible(true);
        }
      } else {
        paginationTranslateY.value = withTiming(0, { duration: PAGINATION_ANIMATION_DURATION });
        setIsPaginationVisible(true);
      }
    },
    [media, paginationTranslateY],
  );

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

  const onPressPagination = React.useCallback(
    (index: number) => {
      carouselRef.current?.scrollTo({
        animated: true,
        count: index - paginationProgress.value,
      });
    },
    [paginationProgress],
  );

  const onOrientationChange = React.useCallback((newOrientation: OrientationType) => {
    if (newOrientation === 'PORTRAIT') setOrientation(PORTRAIT);
    else if (newOrientation === 'LANDSCAPE-LEFT') setOrientation(LANDSCAPE_LEFT);
    else if (newOrientation === 'LANDSCAPE-RIGHT') setOrientation(LANDSCAPE_RIGHT);
  }, []);

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

  const paginationContainerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(paginationTranslateY.value, [0, PAGINATION_ANIMATION_OFFSET], [1, 0]),
      transform: [{ translateY: paginationTranslateY.value }],
    };
  });

  const paginationItemsAnimatedStyle = useAnimatedStyle(() => {
    const distanceToActiveItem =
      paginationProgress.value > media.length - 0.5 ? paginationProgress.value - media.length : paginationProgress.value;

    const screenCenter = orientationShared.value === PORTRAIT ? SCREEN_WIDTH / 2 : SCREEN_HEIGHT / 2;

    return {
      transform: [
        {
          translateX:
            screenCenter -
            INACTIVE_ITEM_WIDTH -
            ITEM_GAP * 2 -
            ACTIVE_ITEM_WIDTH / 2 +
            interpolate(distanceToActiveItem, [1, 0], [0, INACTIVE_ITEM_WIDTH + ITEM_GAP], Extrapolation.EXTEND),
        },
      ],
    };
  });

  const containerStyle = React.useMemo(
    () => [styles.container, { paddingBottom: insets.bottom, paddingTop: insets.top }],
    [insets.top, insets.bottom],
  );

  const carouselDimensions = React.useMemo(
    () => ({
      height: (isPortrait ? SCREEN_HEIGHT : SCREEN_WIDTH) - insets.top - insets.bottom,
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

  // Synchronize state with shared value for pagination animation
  React.useEffect(() => {
    orientationShared.value = orientation;
  }, [orientation, orientationShared]);

  React.useEffect(() => {
    return () => {
      Orientation.lockToPortrait();
    };
  }, []);

  return (
    <PageView style={containerStyle} showNetworkBar={false} showToast={false}>
      <StatusBar type="dark" />
      <OrientationLocker orientation={'UNLOCK'} onChange={onOrientationChange} />
      <View style={styles.carouselContainer}>
        <Carousel
          height={carouselDimensions.height}
          width={carouselDimensions.width}
          data={media}
          defaultIndex={startIndex}
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
        />
      </View>
      {canShowPagination && (
        <View style={styles.paginationGradient}>
          <Animated.View style={paginationContainerAnimatedStyle}>
            <PaginationBackground isPortrait={isPortrait} />
            <Animated.View style={paginationItemsAnimatedStyle}>
              <Pagination.Custom
                containerStyle={styles.paginationContainer}
                data={media}
                onPress={onPressPagination}
                progress={paginationProgress}
                renderItem={renderPaginationItem}
                size={INACTIVE_ITEM_WIDTH}
                dotStyle={styles.paginationDot}
                activeDotStyle={styles.paginationActiveDot}
                customReanimatedStyle={(progress, index, length) => {
                  let distanceToActiveItem = Math.abs(progress - index);
                  if (index === 0 && progress > length - 1) {
                    distanceToActiveItem = Math.abs(progress - length);
                  }

                  return {
                    marginHorizontal: interpolate(distanceToActiveItem, [1, 0], [0, ITEM_GAP], Extrapolation.CLAMP),
                    opacity: interpolate(distanceToActiveItem, [0, 10], [1, 0], Extrapolation.CLAMP),
                  };
                }}
              />
            </Animated.View>
          </Animated.View>
        </View>
      )}
    </PageView>
  );
};
