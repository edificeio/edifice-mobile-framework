import * as React from 'react';
import { Dimensions, ImageURISource, LayoutChangeEvent, Platform, Text, View } from 'react-native';

import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { PanGesture } from 'react-native-gesture-handler';
import VideoPlayer from 'react-native-media-console';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';

import { UI_SIZES } from '../constants';
import styles from './styles';
import { MultimediaCarouselProps } from './types';
import ZoomableImage from './zoomableImage/component';
import ZoomablePdf from './zoomablePdf/component';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import PopupMenu from '~/framework/components/menus/popup';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import NavBarActionsGroup from '~/framework/components/navigation/navbar-actions-group';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';
import { Media, MediaType } from '~/framework/util/media';
import { sessionURISource } from '~/framework/util/transport';

const NavbarButtons = ({ disabled }: { disabled: boolean }) => {
  return (
    <NavBarActionsGroup
      elements={[
        <NavBarAction onPress={() => console.info('download pressed')} icon="ui-download" disabled={disabled} />,
        <PopupMenu
          actions={[
            {
              action: () => console.info('share pressed'),
              icon: {
                android: 'ic_share',
                ios: 'square.and.arrow.up',
              },
              title: I18n.get('carousel-share'),
            },
          ]}>
          <NavBarAction disabled={disabled} icon="ui-options" />
        </PopupMenu>,
      ]}
    />
  );
};

export function computeNavBar({
  navigation,
  route,
}: NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.Carousel>): NativeStackNavigationOptions {
  return {
    ...navBarOptions({
      navigation,
      route,
      title:
        route.params.media.length !== 1
          ? I18n.get('carousel-counter', { current: route.params.startIndex ?? 1, total: route.params.media.length })
          : '',
      titleStyle: styles.title,
    }),
    headerBlurEffect: 'dark',
    headerStyle: { backgroundColor: theme.ui.shadowColorTransparent.toString() },
    headerTransparent: true,
    statusBarColor: theme.palette.grey.darkness.toString(),
  };
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const TOP_INSET = UI_SIZES.screen.topInset;
const isAndroid = Platform.OS === 'android';

const getSignedSource = (src: Media['src']): ImageURISource => {
  let uriSource: ImageURISource;

  if (typeof src === 'string') {
    // For sources parsed from html
    uriSource = { uri: src };
  } else if (src instanceof URL) {
    uriSource = { uri: src.toString() };
  } else {
    // Type compatibility for images, audio, video and pdfs that share this structure
    uriSource = src as ImageURISource;
  }

  return sessionURISource(uriSource);
};

const MultimediaCarouselComponent = (props: MultimediaCarouselProps) => {
  const { navigation, route } = props;
  const startIndex = route.params.startIndex ?? 0;
  const media = React.useMemo(() => route.params.media ?? [], [route]);
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const [currentIndex, setCurrentIndex] = React.useState(startIndex ?? 0);
  const [paginationHeight, setPaginationHeight] = React.useState(0);
  const carouselHeight = SCREEN_HEIGHT - TOP_INSET - paginationHeight;
  const [isCarouselSwipeEnabled, setIsCarouselSwipeEnabled] = React.useState(true);
  const [isNavBarVisible, setNavBarVisible] = React.useState(true);
  const getButtons = React.useCallback((disabled: boolean) => <NavbarButtons disabled={disabled} />, []);

  const configurePanGesture = React.useCallback((panGesture: PanGesture) => {
    if (isAndroid) {
      panGesture.minDistance(50).failOffsetY([-20, 20]).activeOffsetX([-30, 30]);
    }
  }, []);

  const hideNavBar = React.useCallback(() => {
    setNavBarVisible(false);
  }, []);

  const showNavBar = React.useCallback(() => {
    setNavBarVisible(true);
  }, []);

  const toggleNavBarVisibility = React.useCallback(() => {
    setNavBarVisible(prev => !prev);
  }, []);

  const onSnapToItem = React.useCallback(
    (index: number) => {
      setCurrentIndex(index);
      showNavBar();
    },
    [showNavBar],
  );

  // handles title update with current index along with navbar visibility
  React.useEffect(() => {
    if (isNavBarVisible) {
      navigation.setOptions({
        ...computeNavBar({ navigation, route }),
        headerRight: () => getButtons(false),
        headerShown: true,
        headerTitle: navBarTitle(I18n.get('carousel-counter', { current: currentIndex + 1, total: media.length }), styles.title),
      });
    } else {
      navigation.setOptions({
        headerShown: false,
        headerTitle: navBarTitle(I18n.get('carousel-counter', { current: currentIndex + 1, total: media.length }), styles.title),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavBarVisible, media.length, currentIndex]);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      animated: true,
      count: index - progress.value,
    });
  };

  const onPaginationLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      setPaginationHeight(height + 2 * UI_SIZES.spacing.medium);
    },
    [setPaginationHeight],
  );

  const onItemEdgeReached = React.useCallback(
    (direction: 'left' | 'right') => {
      if (direction === 'right' && currentIndex < media.length - 1) {
        ref.current?.next();
      } else if (direction === 'left') {
        ref.current?.prev();
      }
    },
    [currentIndex, media],
  );

  const renderItem = React.useCallback(
    ({ index, item }: { item: Media; index: number }) => {
      const isCurrentItem = index === currentIndex;

      return (
        <View style={styles.item}>
          {item.type === MediaType.IMAGE ? (
            <ZoomableImage
              containerHeight={carouselHeight}
              containerWidth={SCREEN_WIDTH}
              isShown={isCurrentItem}
              onEdgeReached={onItemEdgeReached}
              source={getSignedSource(item.src)}
              toggleNavBarVisibility={toggleNavBarVisibility}
            />
          ) : item.type === MediaType.VIDEO || item.type === MediaType.AUDIO ? (
            <VideoPlayer
              controlTimeoutDelay={3000}
              disableBack
              disableFullscreen
              disableVolume
              onHideControls={isCurrentItem ? hideNavBar : undefined}
              onShowControls={isCurrentItem ? showNavBar : undefined}
              paused={!isCurrentItem}
              repeat={true}
              resizeMode="contain"
              rewindTime={5}
              showOnStart={true}
              source={getSignedSource(item.src)}
              style={styles.mediaContainer}
              tapAnywhereToPause
            />
          ) : item.type === MediaType.ATTACHMENT ? (
            <ZoomablePdf source={getSignedSource(item.src)} setIsCarouselSwipeEnabled={setIsCarouselSwipeEnabled} />
          ) : (
            <Text style={styles.text}>{index}</Text>
          )}
        </View>
      );
    },
    [carouselHeight, currentIndex, hideNavBar, onItemEdgeReached, showNavBar, toggleNavBarVisibility],
  );

  if (!media || media.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.carouselContainer}>
        <Carousel
          data={media}
          enabled={isCarouselSwipeEnabled}
          height={carouselHeight}
          onConfigurePanGesture={configurePanGesture}
          onProgressChange={progress}
          onSnapToItem={onSnapToItem}
          ref={ref}
          renderItem={renderItem}
          width={SCREEN_WIDTH}
          defaultIndex={startIndex}
        />
      </View>

      <View style={styles.paginationWrapper} onLayout={onPaginationLayout}>
        <Pagination.Basic
          containerStyle={styles.paginationContainer}
          data={media}
          dotStyle={styles.paginationDots}
          onPress={onPressPagination}
          progress={progress}
        />
      </View>
    </View>
  );
};

const MultimediaCarousel = ({ navigation, route }: NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.Carousel>) => {
  return <MultimediaCarouselComponent navigation={navigation} route={route} />;
};

export default MultimediaCarousel;
