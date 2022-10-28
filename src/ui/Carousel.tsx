import I18n from 'i18n-js';
import * as React from 'react';
import { Animated, Image, ImageURISource, StatusBar, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import RNCarousel from 'react-native-snap-carousel';
import { NavigationScreenProp, NavigationState } from 'react-navigation';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallItalicText, SmallText } from '~/framework/components/text';
import { openUrl } from '~/framework/util/linking';
import withViewTracking from '~/framework/util/tracker/withViewTracking';

import TouchableOpacity from './CustomTouchableOpacity';
import ImageOptional from './ImageOptional';
import { MediaAction } from './MediaAction';

const UnavailableImage = () => (
  <View
    style={{
      alignItems: 'center',
      height: '100%',
      justifyContent: 'center',
      paddingHorizontal: UI_SIZES.spacing.medium,
      paddingVertical: UI_SIZES.spacing.small,
      width: '100%',
    }}>
    <SmallItalicText>{I18n.t('imageNotAvailable')}</SmallItalicText>
  </View>
);

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

class Carousel extends React.Component<
  {
    navigation: NavigationScreenProp<NavigationState>;
  },
  {
    viewport: {
      width: number;
      height: number;
    };
    imageSizes: { width: number; height: number }[];
    currentIndex: number;
    canPanHorizontal: boolean;
    canPanVertical: boolean;
  }
> {
  public carouselRef: any;
  public currentScroll = 0;
  public previousScroll = 0;
  public currentImage: number = 0;

  public state = {
    viewport: {
      height: UI_SIZES.screen.height,
      width: UI_SIZES.screen.width,
    },
    imageSizes: [],
    currentIndex: (this.props.navigation && this.props.navigation.getParam('startIndex')) || 0,
    canPanHorizontal: false,
    canPanVertical: false,
  };

  baseOffsetX = new Animated.Value(0);
  panOffsetX = new Animated.Value(0);
  offsetX = Animated.add(this.baseOffsetX, this.panOffsetX);
  lastOffsetX = 0;
  baseOffsetY = new Animated.Value(0);
  panOffsetY = new Animated.Value(0);
  offsetY = Animated.add(this.baseOffsetY, this.panOffsetY);
  lastOffsetY = 0;

  public onPanXSpringEvent = () => {
    Animated.spring(this.baseOffsetX, {
      toValue: this.lastOffsetX > 0 ? this.sideHiddenWidth : -this.sideHiddenWidth,
      useNativeDriver: false,
      friction: 10,
    }).start();
    this.lastOffsetX = this.lastOffsetX > 0 ? this.sideHiddenWidth : -this.sideHiddenWidth;
  };

  public onPanYSpringEvent = () => {
    Animated.spring(this.baseOffsetY, {
      toValue: this.lastOffsetY > 0 ? this.sideHiddenHeight : -this.sideHiddenHeight,
      useNativeDriver: false,
      friction: 10,
    }).start();
    this.lastOffsetY = this.lastOffsetY > 0 ? this.sideHiddenHeight : -this.sideHiddenHeight;
  };

  public allowedPanGestures: () => any = () => {
    const { canPanHorizontal } = this.state;
    const gestures: { translationY: any; translationX?: any } = { translationY: this.panOffsetY };
    canPanHorizontal && (gestures.translationX = this.panOffsetX);
    return gestures;
  };

  public onPanGestureEvent = () => Animated.event([{ nativeEvent: this.allowedPanGestures() }], { useNativeDriver: false });

  public onPanStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { canPanHorizontal, currentIndex, imageSizes } = this.state;
      const { navigation } = this.props;
      const panSpringLimit = 100;

      this.lastOffsetY += event.nativeEvent.translationY;
      this.baseOffsetY.setValue(this.lastOffsetY);
      this.panOffsetY.setValue(0);
      if (canPanHorizontal) {
        this.lastOffsetX += event.nativeEvent.translationX;
        this.baseOffsetX.setValue(this.lastOffsetX);
        this.panOffsetX.setValue(0);
      }

      if (this.sideHiddenWidth <= Math.abs(this.lastOffsetX)) {
        if (this.sideHiddenWidth + panSpringLimit < Math.abs(this.lastOffsetX)) {
          if (this.lastOffsetX > 0) {
            currentIndex === 0 ? this.onPanXSpringEvent() : this.carouselRef.snapToPrev();
          } else {
            currentIndex === imageSizes.length - 1 ? this.onPanXSpringEvent() : this.carouselRef.snapToNext();
          }
        } else this.onPanXSpringEvent();
      }
      if (this.sideHiddenHeight <= Math.abs(this.lastOffsetY)) {
        if (this.sideHiddenHeight + panSpringLimit < this.lastOffsetY) {
          navigation.goBack();
        } else this.onPanYSpringEvent();
      }
    }
  };

  baseScale = new Animated.Value(1);
  pinchScale = new Animated.Value(1);
  scale = Animated.multiply(this.baseScale, this.pinchScale);
  lastScale = 1;
  sideHiddenWidth = 0;
  sideHiddenHeight = 0;

  public onZoomEvent = Animated.event([{ nativeEvent: { scale: this.pinchScale } }], { useNativeDriver: false });

  public onZoomStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { imageSizes, currentIndex } = this.state;
      const currentImageSizes = imageSizes && imageSizes[currentIndex];
      const currentImageWidth = currentImageSizes && currentImageSizes.width;
      const currentImageHeight = currentImageSizes && currentImageSizes.height;

      this.lastScale *= event.nativeEvent.scale;
      this.baseScale.setValue(this.lastScale);
      this.pinchScale.setValue(1);

      const minScale = 1;
      const maxScale = 5;

      let displayedWidth;
      let displayedHeight;
      const isWithinScreeen = currentImageWidth <= UI_SIZES.screen.width && currentImageHeight <= UI_SIZES.screen.height;
      const isVerticalImage = currentImageWidth < currentImageHeight;
      const isThinVerticalImage = isVerticalImage && currentImageWidth < UI_SIZES.screen.width;
      if (isWithinScreeen) {
        displayedWidth = currentImageWidth;
        displayedHeight = currentImageHeight;
      } else if (isThinVerticalImage) {
        displayedWidth = currentImageWidth * (UI_SIZES.screen.height / currentImageHeight);
        displayedHeight = UI_SIZES.screen.height;
      } else {
        displayedWidth = UI_SIZES.screen.width;
        displayedHeight = currentImageHeight * (UI_SIZES.screen.width / currentImageWidth);
      }

      const scaledImageWidth = this.lastScale < maxScale ? this.lastScale * displayedWidth : maxScale * displayedWidth;
      const totalHiddenWidth = scaledImageWidth - UI_SIZES.screen.width < 0 ? 0 : scaledImageWidth - UI_SIZES.screen.width;
      const sideHiddenWidth = totalHiddenWidth / 2;
      this.sideHiddenWidth = sideHiddenWidth;

      const scaledImageHeight = this.lastScale < maxScale ? this.lastScale * displayedHeight : maxScale * displayedHeight;
      const totalHiddenHeight = scaledImageHeight - UI_SIZES.screen.height < 0 ? 0 : scaledImageHeight - UI_SIZES.screen.height;
      const sideHiddenHeight = totalHiddenHeight / 2;
      this.sideHiddenHeight = sideHiddenHeight;

      scaledImageWidth > UI_SIZES.screen.width
        ? this.setState({ canPanHorizontal: true })
        : this.setState({ canPanHorizontal: false });
      scaledImageHeight > UI_SIZES.screen.height
        ? this.setState({ canPanVertical: true })
        : this.setState({ canPanVertical: false });

      if (this.lastScale > maxScale) {
        this.lastScale = maxScale;
        Animated.spring(this.baseScale, {
          toValue: maxScale,
          useNativeDriver: false,
          friction: 10,
        }).start();
      } else if (this.lastScale < minScale) {
        Animated.spring(this.baseScale, {
          toValue: 1,
          useNativeDriver: false,
          friction: 10,
        }).start();
        this.lastScale = 1;
        this.panOffsetX.setValue(0);
        this.baseOffsetX.setValue(0);
        this.lastOffsetX = 0;
        this.panOffsetY.setValue(0);
        this.baseOffsetY.setValue(0);
        this.lastOffsetY = 0;
      }
    }
  };

  public scrollToCurrentImage() {
    this.carouselRef.scrollToIndex({
      index: this.currentImage,
      viewOffset: 0,
      viewPosition: 0.5,
    });
  }

  public slideToImage(e: number) {
    this.carouselRef.scrollToIndex({
      index: e,
      viewOffset: 0,
      viewPosition: 0.5,
    });
  }

  componentDidMount() {
    const { navigation } = this.props;
    const images = (navigation && navigation.getParam('images')) || [];
    images.forEach((image, index) =>
      Image.getSizeWithHeaders(image.src.uri, image.src.headers, (width: number, height: number) =>
        this.setState(prevstate => {
          const newImagesSizes = prevstate.imageSizes;
          newImagesSizes[index] = { width, height };
          return { imageSizes: newImagesSizes };
        }),
      ),
    );
  }

  public render() {
    const { navigation } = this.props;
    const { imageSizes, viewport, currentIndex, canPanHorizontal, canPanVertical } = this.state;
    const images = (navigation && navigation.getParam('images')) || [];
    const startIndex = navigation && navigation.getParam('startIndex');

    const imagePinch = React.createRef<PinchGestureHandler>();
    const imagePan = React.createRef<PanGestureHandler>();

    const currentImageSizes = imageSizes && imageSizes[currentIndex];
    const currentImageWidth = currentImageSizes && currentImageSizes.width;
    const currentImageHeight = currentImageSizes && currentImageSizes.height;

    const imageWidth = currentImageWidth && Math.min(UI_SIZES.screen.width, currentImageWidth);
    const imageHeight = currentImageHeight && Math.min(UI_SIZES.screen.height, currentImageHeight);

    return (
      <View
        style={{ flex: 1, backgroundColor: theme.palette.grey.black }}
        onLayout={() => {
          this.setState({
            viewport: {
              height: UI_SIZES.screen.height,
              width: UI_SIZES.screen.width,
            },
          });
        }}>
        <StatusBar backgroundColor={theme.palette.grey.black} barStyle="light-content" />
        <RNCarousel
          data={images}
          renderItem={({ item, index }: { item: { src: ImageURISource; alt: string; linkTo?: string }; index: number }) => (
            <View
              key={index}
              style={{
                height: '100%',
                width: UI_SIZES.screen.width,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {imageSizes[index] && (
                <ImageOptional
                  source={item.src}
                  errorComponent={<UnavailableImage />}
                  imageComponent={() => (
                    <Animated.View
                      style={{
                        height: imageHeight,
                        width: imageWidth,
                        transform: [
                          { scale: currentIndex === index ? this.scale : 1 },
                          { translateX: currentIndex === index ? Animated.divide(this.offsetX, this.scale) : 0 },
                          { translateY: currentIndex === index ? Animated.divide(this.offsetY, this.scale) : 0 },
                        ],
                      }}>
                      <PanGestureHandler
                        onGestureEvent={this.onPanGestureEvent()}
                        onHandlerStateChange={this.onPanStateChange}
                        enabled={canPanHorizontal || canPanVertical}
                        ref={imagePan}
                        simultaneousHandlers={imagePinch}>
                        <Animated.View>
                          <PinchGestureHandler
                            onGestureEvent={this.onZoomEvent}
                            onHandlerStateChange={this.onZoomStateChange}
                            ref={imagePinch}
                            simultaneousHandlers={imagePan}>
                            <Animated.View>
                              <AnimatedFastImage
                                source={item.src}
                                style={{
                                  height: imageHeight,
                                  width: imageWidth,
                                }}
                                resizeMode="contain"
                              />
                            </Animated.View>
                          </PinchGestureHandler>
                        </Animated.View>
                      </PanGestureHandler>
                    </Animated.View>
                  )}
                />
              )}
              {item.linkTo && (
                <View
                  style={{
                    bottom: UI_SIZES.spacing.medium,
                    padding: UI_SIZES.spacing.big,
                    position: 'absolute',
                    width: '100%',
                  }}>
                  <TouchableOpacity
                    onPress={() => openUrl(item.linkTo)}
                    style={{
                      backgroundColor: theme.palette.grey.graphite,
                      padding: UI_SIZES.spacing.small,
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <SmallText style={{ color: theme.palette.grey.fog, textAlign: 'center' }}>
                      {I18n.t('linkTo')}{' '}
                      <SmallText style={{ color: theme.palette.complementary.blue.regular }}>
                        {(() => {
                          const matches = item.linkTo.match(
                            // from https://stackoverflow.com/a/8498629/6111343
                            /^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i,
                          );
                          return matches && matches[1];
                        })()}
                      </SmallText>
                    </SmallText>
                    <NamedSVG
                      name="ui-externalLink"
                      width={16}
                      height={16}
                      fill={theme.palette.grey.fog}
                      style={{ marginLeft: UI_SIZES.spacing._LEGACY_small }}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          sliderWidth={viewport.width}
          itemWidth={viewport.width}
          firstItem={startIndex || 0}
          ref={r => (this.carouselRef = r)}
          scrollEventThrottle={16}
          keyExtractor={(index: number) => index.toString()}
          decelerationRate="fast"
          onSnapToItem={(index: number) => {
            this.setState({
              currentIndex: index,
              canPanHorizontal: false,
              canPanVertical: false,
            });
            this.pinchScale.setValue(1);
            this.baseScale.setValue(1);
            this.lastScale = 1;
            this.panOffsetX.setValue(0);
            this.baseOffsetX.setValue(0);
            this.lastOffsetX = 0;
            this.panOffsetY.setValue(0);
            this.baseOffsetY.setValue(0);
            this.lastOffsetY = 0;
          }}
        />
        <MediaAction iconName="close" action={() => navigation.goBack()} />
      </View>
    );
  }
}

export default withViewTracking('carousel')(Carousel);
