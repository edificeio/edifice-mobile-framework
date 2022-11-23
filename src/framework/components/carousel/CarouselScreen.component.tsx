/**
 * New implementation of Carousel built with react-native-reanimated-carousel !
 */
import I18n from 'i18n-js';
import * as React from 'react';
import { ImageURISource, Platform, StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WebView from 'react-native-webview';
import { WebViewSource } from 'react-native-webview/lib/WebViewTypes';
import { NavigationInjectedProps } from 'react-navigation';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/ActionButton';
import ImageViewer from '~/framework/components/carousel/image-viewer';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { FakeHeader } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import { FastImage, IMedia, Image } from '~/framework/util/media';
import { urlSigner } from '~/infra/oauth';
import { Loading } from '~/ui/Loading';

export interface ICarouselNavParams {
  data: IMedia[];
  startIndex?: number;
}

export interface ICarouselProps extends NavigationInjectedProps<ICarouselNavParams> {}

function getItemKey(item: IMedia, index: number) {
  return typeof (item.src === 'string' ? item.src : (item.src as ImageURISource).uri) ?? index;
}

const styles = StyleSheet.create({
  page: { backgroundColor: theme.palette.grey.black },
  header: {
    position: 'absolute',
    backgroundColor: '#0000007f',
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
  mediaWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

const CarouselItem = React.memo(function CarouselItem({ media }: { media: IMedia }) {
  let component;
  if (media.type === 'image') {
    const imageStyle = {
      width: UI_SIZES.screen.width,
      height: UI_SIZES.screen.height,
    };
    component =
      typeof media.src === 'number' ? (
        <Image source={media.src} style={imageStyle} resizeMode="contain" resizeMethod="scale" />
      ) : (
        Platform.select({
          ios: (
            <PhotoView
              source={urlSigner.signURISource(media.src)}
              minimumZoomScale={1}
              maximumZoomScale={3}
              resizeMode="center"
              style={imageStyle}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            />
            //<Text>{JSON.stringify(media)}</Text>
            //<FastImage source={media.src as Source} style={imageStyle} resizeMode={RNFastImage.resizeMode.contain} />
          ),
          android: (
            // <ImageZoom
            //   source={urlSigner.signURISource(media.src)}
            //   minScale={1}
            //   maxScale={3}
            //   containerStyle={imageStyle}
            //   resizeMode="contain"
            //   resizeMethod="scale"
            // />
            // <ReactNativeZoomableView
            //   maxZoom={3}
            //   minZoom={1}
            //   zoomStep={1}
            //   initialZoom={1}
            //   bindToBorders={false}
            //   contentWidth={UI_SIZES.screen.width}
            //   contentHeight={UI_SIZES.screen.height}
            //   onStartShouldSetPanResponder={e => { e.stopPropagation(); return true;}}
            //   onMoveShouldSetResponder={e => { e.stopPropagation(); return true;}}
            //   onPanResponderMove={e => { e.stopPropagation(); return true;}}>
            //  <FastImage source={media.src as Source} style={imageStyle} resizeMode={RNFastImage.resizeMode.contain} />
            // </ReactNativeZoomableView>
            // <Zoom>
            //   <FastImage source={media.src as Source} style={imageStyle} resizeMode={RNFastImage.resizeMode.contain} />
            // </Zoom>
            // <ImageZoom
            //   cropWidth={UI_SIZES.screen.width}
            //   cropHeight={UI_SIZES.screen.height}
            //   imageWidth={UI_SIZES.screen.width}
            //   imageHeight={UI_SIZES.screen.height}>
            //   <FastImage source={media.src as Source} style={imageStyle} resizeMode={RNFastImage.resizeMode.contain} />
            // </ImageZoom>
            // <PhotoZoom
            //   source={urlSigner.signURISource(media.src)}
            //   minimumZoomScale={1}
            //   maximumZoomScale={3}
            //   androidScaleType="center"
            //   style={{ width: UI_SIZES.screen.width, height: UI_SIZES.screen.height }}
            // />
            <WebView
              source={urlSigner.signURISource(media.src) as WebViewSource}
              style={UI_STYLES.flex1}
              containerStyle={{ backgroundColor: theme.palette.grey.black }}
            />
            // <SimpleImageViewer imageUri={urlSigner.signURISource(media.src)} isVisible={true} />
          ),
        })!
      );
  } else component = null;

  return (
    <>
      {/* <View style={styles.mediaWrapper}>
        <Loading customColor={theme.ui.text.inverse.toString()} />
      </View> */}
      {component}
    </>
  );
});

function renderCarouselItem({ item, index }: { item: IMedia; index: number }) {
  return <CarouselItem media={item} />;
}

export function openCarousel(props: ICarouselNavParams, navigation: any) {
  navigation.navigate('carouselModal2', props);
}

export function Carousel(props: ICarouselProps) {
  const { navigation } = props;
  const startIndex = navigation.getParam('startIndex') ?? 0;
  const data = navigation.getParam('data') ?? []; // See big hack of the death
  const dataAsImages = data.map(d => ({ url: '', props: { source: urlSigner.signURISource(d.src) } }));
  // populate with dummy public images
  // for (let i = 0; i < dataAsImages.length - 3; i += 3) {
  //   dataAsImages[i] = {
  //     url: 'https://media.istockphoto.com/id/495672715/fr/photo/house-tanners-quartier-de-la-petite-france-strasbourg-france.jpg?s=1024x1024&w=is&k=20&c=6fIjMqcYYbAr9g7Gg8k2tKO2oNgJgWUVT8XoIiNrKeI=',
  //   };
  //   dataAsImages[i + 1] = {
  //     url: 'https://www.abondance.com/wp-content/uploads/2018/07/pirates-des-caraibes.jpg',
  //   };
  //   dataAsImages[i + 2] = {
  //     props: {
  //       source: { uri: 'https://www.rmg.co.uk/sites/default/files/styles/max_2600x2600/public/2021-11/1100653_large.jpg?itok=XFEZ9_enntent/uploads/2018/07/pirates-des-caraibes.jpg' },
  //     },
  //   };
  //   // dataAsImages[i + 2] = {
  //   //   url: 'https://www.francetvinfo.fr/pictures/fWKk12niKKgxo3ybwPXSW-TqzFQ/30x0:737x397/fit-in/720x/filters:format(webp)/2012/08/08/ICHCok.png',
  //   // };
  // }

  // const carouselRef = React.useRef<ICarouselInstance>();
  const [isNavBarVisible, setNavBarVisible] = React.useState(true);

  const closeButton = React.useMemo(
    () => <ActionButton action={navigation.goBack} iconName="ui-rafterLeft" style={styles.closeButton} />,
    [navigation],
  );

  return (
    <GestureHandlerRootView style={UI_STYLES.flex1}>
      <PageView navigation={navigation} style={styles.page}>
        <StatusBar backgroundColor={theme.palette.grey.black} barStyle="light-content" />
        {/* <RNCarousel
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
        /> */}

        {/* <Pager.Root circular={true} activeIndex={startIndex}>
          <Pager.Container>
            {data.map((media, index) => (
              <Pager.Page key={getItemKey(media, index)}>
                <CarouselItem media={media} />
              </Pager.Page>
            ))}
          </Pager.Container>
        </Pager.Root> */}

        {/* <PagerView style={UI_STYLES.flex1} initialPage={startIndex}>
          {data.map((media, index) => (
            <View key={getItemKey(media, index)}>
              <CarouselItem media={media} />
            </View>
          ))}
        </PagerView> */}

        {/* <LazyPagerView
          data={data}
          keyExtractor={getItemKey}
          renderItem={({ item, index }) => <CarouselItem media={item} />}
          buffer={3}
          maxRenderWindow={7}
        /> */}

        {/* <Swiper
          showsPagination={false}
          loop={true}
          loadMinimal={false}
          loadMinimalSize={5}
          loadMinimalLoader={<Loading customColor={theme.ui.text.inverse.toString()} />}
          index={startIndex}>
          {data.map((media, index) => (
            <CarouselItem media={media} key={getItemKey(media, index)} />
          ))}
        </Swiper> */}

        <ImageViewer
          enableSwipeDown
          show={true}
          useNativeDriver={true}
          imageUrls={dataAsImages}
          index={startIndex}
          onCancel={() => {
            navigation.goBack();
          }}
          renderImage={props => <FastImage {...props} />}
          loadingRender={() => <Loading />}
          loadWindow={1}
          renderIndicator={(current, total) => (
            <FakeHeader
              left={closeButton}
              style={[styles.header, { opacity: isNavBarVisible ? 1 : 0 }]}
              title={I18n.t('carousel.counter', { current, total })}
            />
          )}
          saveToLocalByLongPress={false}
          onClick={() => {
            setNavBarVisible(!isNavBarVisible);
          }}
        />
      </PageView>
    </GestureHandlerRootView>
  );
}

export default Carousel;

// A remplacer dans pager-rn/index.js L63 :
//
// gesture.onEnd(function (event) {
//   var offsetAnticipation = Math.max(Math.min(event.velocityX, pageSize / 2), -pageSize / 2);
//   var nextIndex = Math.round((offset.value + offsetAnticipation) / pageSize) * -1;
//   if (!circular) {
//       nextIndex = Math.min(Math.max(nextIndex, 0), pageCount - 1);
//   }
//   setOffsetForIndex(nextIndex);
//   runOnJS(setActiveIndex)(nextIndex);
// });
