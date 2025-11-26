import * as React from 'react';
import { Dimensions, LayoutChangeEvent, Platform, Text, View } from 'react-native';

import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { PanGesture } from 'react-native-gesture-handler';
import VideoPlayer from 'react-native-media-console';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';

import { UI_SIZES } from '../constants';
import styles from './styles';
import ZoomableImage from './zoomableImage/component';
import ZoomablePdf from './zoomablePdf/component';

import theme from '~/app/theme';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarOptions } from '~/framework/navigation/navBar';

export type CarouselItem =
  | { type: 'image'; source: any }
  | { type: 'video'; source: any }
  | { type: 'audio'; source: any }
  | { type: 'pdf'; source: any }
  | { type: 'text' };

const data: CarouselItem[] = [
  { source: require('../../../../assets/plume.jpg'), type: 'image' },
  { source: 'https://www.drumstheword.com/pdf/GreenDay_Burnout.pdf', type: 'pdf' },
  {
    source: 'https://www.snes.edu/IMG/pdf/2nd_histoire-geographie.pdf',
    type: 'pdf',
  },
  {
    source: 'https://etab.ac-poitiers.fr/coll-marennes/sites/coll-marennes/IMG/pdf/livret_de_grammaire_3eme-compresse.pdf',
    type: 'pdf',
  },
  { source: require('../../../../assets/bigImage.jpg'), type: 'image' },
  { source: require('../../../../assets/landscape-photo.jpg'), type: 'image' },
  { source: require('../../../../assets/squirrel.mp4'), type: 'video' },
  { source: require('../../../../assets/audioFile.m4a'), type: 'audio' },
  { source: require('../../../../assets/landscape-video.mp4'), type: 'video' },
  { type: 'text' },
  { type: 'text' },
];

export function computeNavBar({
  navigation,
  route,
}: NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.Carousel>): NativeStackNavigationOptions {
  return {
    ...navBarOptions({
      navigation,
      route,
      title: 'check',
      // title: route.params.data.length !== 1
      //     route.params.data.length !== 1
      //       ? I18n.get('carousel-counter', { current: route.params.startIndex ?? 1, total: route.params.data.length })
      //       : '',
      //   titleStyle: styles.title,
    }),
    headerBlurEffect: 'dark',
    headerStyle: { backgroundColor: theme.ui.shadowColorTransparent.toString() },
    headerTransparent: true,
  };
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const TOP_INSET = UI_SIZES.screen.topInset;
const isAndroid = Platform.OS === 'android';

const MultimediaCarousel = () => {
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [paginationHeight, setPaginationHeight] = React.useState(0);
  const carouselHeight = SCREEN_HEIGHT - TOP_INSET - paginationHeight;
  const [isCarouselSwipeEnabled, setIsCarouselSwipeEnabled] = React.useState(true);

  const configurePanGesture = React.useCallback((panGesture: PanGesture) => {
    if (isAndroid) {
      panGesture.minDistance(50).failOffsetY([-20, 20]).activeOffsetX([-30, 30]);
    }
  }, []);

  const onSnapToItem = React.useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

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
      if (direction === 'right' && currentIndex < data.length - 1) {
        ref.current?.next();
      } else if (direction === 'left') {
        ref.current?.prev();
      }
    },
    [currentIndex],
  );

  const renderItem = React.useCallback(
    ({ index, item }: { item: CarouselItem; index: number }) => {
      const isCurrentItem = index === currentIndex;
      const itemStyle = [styles.item, item.type !== 'image' && { backgroundColor: 'red' }];

      return (
        <View style={itemStyle}>
          {item.type === 'image' ? (
            <ZoomableImage
              containerHeight={carouselHeight}
              containerWidth={SCREEN_WIDTH}
              isShown={isCurrentItem}
              onEdgeReached={onItemEdgeReached}
              source={item.source}
            />
          ) : item.type === 'video' || item.type === 'audio' ? (
            <VideoPlayer
              controlTimeoutDelay={3000}
              disableBack
              disableFullscreen
              disableVolume
              paused={!isCurrentItem}
              repeat={true}
              resizeMode="contain"
              rewindTime={5}
              showOnStart={true}
              source={item.source}
              style={styles.mediaContainer}
            />
          ) : item.type === 'pdf' ? (
            <ZoomablePdf source={{ uri: item.source }} setIsCarouselSwipeEnabled={setIsCarouselSwipeEnabled} />
          ) : (
            <Text style={styles.text}>{index}</Text>
          )}
        </View>
      );
    },
    [carouselHeight, currentIndex, onItemEdgeReached],
  );

  return (
    <View style={styles.container}>
      <View style={styles.carouselContainer}>
        <Carousel
          data={data}
          enabled={isCarouselSwipeEnabled}
          height={carouselHeight}
          onConfigurePanGesture={configurePanGesture}
          onProgressChange={progress}
          onSnapToItem={onSnapToItem}
          ref={ref}
          renderItem={renderItem}
          width={SCREEN_WIDTH}
        />
      </View>

      <View style={styles.paginationWrapper} onLayout={onPaginationLayout}>
        <Pagination.Basic
          containerStyle={styles.paginationContainer}
          data={data}
          dotStyle={styles.paginationDots}
          onPress={onPressPagination}
          progress={progress}
        />
      </View>
    </View>
  );
};

export default MultimediaCarousel;
