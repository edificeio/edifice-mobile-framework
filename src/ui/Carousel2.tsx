/**
 * New implementation of Carousel built with react-native-reanimated-carousel !
 */
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import I18n from 'i18n-js';
import * as React from 'react';
import { ImageURISource, Platform, StatusBar, StyleSheet, Text } from 'react-native';
import PhotoView from 'react-native-photo-view-ex';
import RNCarousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { NavigationInjectedProps } from 'react-navigation';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/ActionButton';
import { UI_SIZES } from '~/framework/components/constants';
import { FakeHeader, HeaderAction } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import { FastImage, IMedia, Image } from '~/framework/util/media';
import { urlSigner } from '~/infra/oauth';

export interface ICarouselNavParams {
  data: IMedia[];
  startIndex?: number;
}

export interface ICarouselProps extends NavigationInjectedProps<ICarouselNavParams> {}

function getItemKey({ item, index }: { item: IMedia; index: number }) {
  return typeof (item.src === 'string' ? item.src : (item.src as ImageURISource).uri) ?? index;
}

const styles = StyleSheet.create({
  page: { backgroundColor: theme.palette.grey.black },
  header: {
    position: 'absolute',
    backgroundColor: '#00000055',
    zIndex: 10,
  },
  closeButton: {
    width: UI_SIZES.dimensions.width.huge,
    height: UI_SIZES.dimensions.width.huge,
    padding: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    marginHorizontal: UI_SIZES.spacing.minor,
  },
});

function renderCarouselItem({ item, index }: { item: IMedia; index: number }) {
  if (item.type === 'image') {
    const imageStyle = {
      width: UI_SIZES.screen.width,
      height: UI_SIZES.screen.height,
    };
    return typeof item.src === 'number' ? (
      <Image source={item.src} style={imageStyle} resizeMode="contain" resizeMethod="scale" />
    ) : (
      Platform.select({
        ios: (
          <PhotoView
            source={urlSigner.signURISource(item.src)}
            minimumZoomScale={1}
            maximumZoomScale={3}
            resizeMode="center"
            style={imageStyle}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          />
        ),
        android: (
          <ImageZoom
            source={urlSigner.signURISource(item.src)}
            minScale={1}
            maxScale={3}
            containerStyle={imageStyle}
            resizeMode="contain"
            resizeMethod="scale"
          />
          // <FastImage source={item.src as Source} style={imageStyle} resizeMode={RNFastImage.resizeMode.contain} />
        ),
      })
    );
  } else return <></>;
}

export function openCarousel(props: ICarouselNavParams, navigation: any) {
  navigation.navigate('carouselModal2', props);
}

export function Carousel(props: ICarouselProps) {
  const { navigation } = props;
  const startIndex = navigation.getParam('startIndex') ?? 0;
  const data = navigation.getParam('data') ?? []; // See big hack of the death
  const carouselRef = React.useRef<ICarouselInstance>();

  const closeButton = React.useMemo(
    () => <ActionButton action={navigation.goBack} iconName="ui-rafterLeft" style={styles.closeButton} />,
    [navigation],
  );

  return (
    <PageView navigation={navigation} style={styles.page}>
      <StatusBar backgroundColor={theme.palette.grey.black} barStyle="light-content" />
      <FakeHeader left={closeButton} style={styles.header} />
      <RNCarousel
        // Layout
        width={UI_SIZES.screen.width}
        height={UI_SIZES.screen.height}
        // Data
        data={data}
        renderItem={renderCarouselItem}
        defaultIndex={startIndex}
        // Control
        ref={carouselRef}
        loop
        // Gestures
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
        windowSize={3}
      />
    </PageView>
  );
}

export default Carousel;
