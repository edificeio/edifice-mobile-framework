import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import {
  Dimensions,
  ImageURISource,
  Linking,
  Platform,
  Image,
  Text,
  View,
  ScrollView,
  StatusBar,
  Animated,
} from "react-native";
import FastImage from "react-native-fast-image";
import RNCarousel from "react-native-snap-carousel";
import { PinchGestureHandler, State, PanGestureHandler } from "react-native-gesture-handler";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import { CommonStyles } from "../styles/common/styles";
import TouchableOpacity from "./CustomTouchableOpacity";
import ImageOptional from "./ImageOptional";
import { A, Italic } from "./Typography";
import withViewTracking from "../framework/util/tracker/withViewTracking";
import { MediaAction } from "./MediaAction";

const UnavailableImage = () => (
  <View
    style={{
      alignItems: "center",
      height: "100%",
      justifyContent: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      width: "100%"
    }}
  >
    <Italic>{I18n.t("imageNotAvailable")}</Italic>
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
    imageSizes: Array<{ width: number, height: number }>;
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
      height: Dimensions.get("window").height,
      width: Dimensions.get("window").width
    },
    imageSizes: [],
    currentIndex: this.props.navigation && this.props.navigation.getParam("startIndex") || 0,
    canPanHorizontal: false,
    canPanVertical: false
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
      useNativeDriver: true,
      friction: 10
    }).start()
    this.lastOffsetX = this.lastOffsetX > 0 ? this.sideHiddenWidth : -this.sideHiddenWidth;
  }

  public onPanYSpringEvent = () => {
    Animated.spring(this.baseOffsetY, {
      toValue: this.lastOffsetY > 0 ? this.sideHiddenHeight : -this.sideHiddenHeight,
      useNativeDriver: true,
      friction: 10
    }).start()
    this.lastOffsetY = this.lastOffsetY > 0 ? this.sideHiddenHeight : -this.sideHiddenHeight;
  }
  
  public allowedPanGestures: () => any = () => {
    const { canPanHorizontal } = this.state;
    const gestures: { translationY: any, translationX?: any } = { translationY: this.panOffsetY };
    canPanHorizontal && (gestures.translationX = this.panOffsetX);
    return gestures;
  }
  
  public onPanGestureEvent = () => Animated.event([{nativeEvent: this.allowedPanGestures()}]);
  
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
            currentIndex === imageSizes.length-1 ? this.onPanXSpringEvent() : this.carouselRef.snapToNext();
          }
        } else this.onPanXSpringEvent();
      }
      if (this.sideHiddenHeight <= Math.abs(this.lastOffsetY)) {
        if (this.sideHiddenHeight + panSpringLimit < this.lastOffsetY) {
          navigation.goBack();
        } else this.onPanYSpringEvent();
      }
    }
  }

  baseScale = new Animated.Value(1);
  pinchScale = new Animated.Value(1);
  scale = Animated.multiply(this.baseScale, this.pinchScale);
  lastScale = 1;
  sideHiddenWidth = 0;
  sideHiddenHeight = 0;

  public onZoomEvent = Animated.event([{nativeEvent: { scale: this.pinchScale }}])

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
      const isWithinScreeen = currentImageWidth <= Dimensions.get("window").width && currentImageHeight <= Dimensions.get("window").height;
      const isVerticalImage = currentImageWidth < currentImageHeight;
      const isThinVerticalImage = isVerticalImage && currentImageWidth < Dimensions.get("window").width;
      if (isWithinScreeen) {
        displayedWidth = currentImageWidth;
        displayedHeight = currentImageHeight;
      } else if (isThinVerticalImage) {
        displayedWidth = currentImageWidth * (Dimensions.get("window").height/currentImageHeight);
        displayedHeight = Dimensions.get("window").height;
      } else {
        displayedWidth = Dimensions.get("window").width;
        displayedHeight = currentImageHeight * (Dimensions.get("window").width/currentImageWidth);
      }

      const scaledImageWidth = this.lastScale < maxScale ? this.lastScale * displayedWidth : maxScale * displayedWidth;
      const totalHiddenWidth = scaledImageWidth - Dimensions.get("window").width < 0 ? 0 : scaledImageWidth - Dimensions.get("window").width;
      const sideHiddenWidth = totalHiddenWidth/2;
      this.sideHiddenWidth = sideHiddenWidth;

      const scaledImageHeight = this.lastScale < maxScale ? this.lastScale * displayedHeight : maxScale * displayedHeight;
      const totalHiddenHeight = scaledImageHeight - Dimensions.get("window").height < 0 ? 0 : scaledImageHeight - Dimensions.get("window").height;
      const sideHiddenHeight = totalHiddenHeight/2;
      this.sideHiddenHeight = sideHiddenHeight;

      scaledImageWidth > Dimensions.get("window").width ? this.setState({ canPanHorizontal: true }) : this.setState({ canPanHorizontal: false });
      scaledImageHeight > Dimensions.get("window").height ? this.setState({ canPanVertical: true }) : this.setState({ canPanVertical: false });

      if (this.lastScale > maxScale) {
        this.lastScale = maxScale;
        Animated.spring(this.baseScale, {
          toValue: maxScale,
          useNativeDriver: true,
          friction: 10
        }).start()
      } else if (this.lastScale < minScale) {
        Animated.spring(this.baseScale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 10
        }).start()
        this.lastScale = 1;
        this.panOffsetX.setValue(0);
        this.baseOffsetX.setValue(0);
        this.lastOffsetX = 0;
        this.panOffsetY.setValue(0);
        this.baseOffsetY.setValue(0);
        this.lastOffsetY = 0;
      }
    }
  }

  public scrollToCurrentImage() {
    this.carouselRef.scrollToIndex({
      index: this.currentImage,
      viewOffset: 0,
      viewPosition: 0.5
    });
  }

  public slideToImage(e: number) {
    this.carouselRef.scrollToIndex({
      index: e,
      viewOffset: 0,
      viewPosition: 0.5
    });
  }

  componentDidMount() {
    const { navigation } = this.props;
    const images = navigation && navigation.getParam("images") || [];
    images.forEach((image, index) =>
      Image.getSizeWithHeaders(
        image.src.uri,
        image.src.headers,
        (width: number, height: number) => this.setState(prevstate => {
          const newImagesSizes = prevstate.imageSizes;
          newImagesSizes[index] = { width, height };
          return { imageSizes: newImagesSizes }
        }),
      )
    )
  }

  public render() {
    const { navigation } = this.props;
    const { imageSizes, viewport, currentIndex, canPanHorizontal, canPanVertical } = this.state;
    const images = navigation && navigation.getParam("images") || [];
    const startIndex = navigation && navigation.getParam("startIndex");

    const imagePinch = React.createRef<PinchGestureHandler>();
    const imagePan = React.createRef<PanGestureHandler>();

    const currentImageSizes = imageSizes && imageSizes[currentIndex];
    const currentImageWidth = currentImageSizes && currentImageSizes.width;
    const currentImageHeight = currentImageSizes && currentImageSizes.height;

    const imageWidth = currentImageWidth && Math.min(Dimensions.get("window").width, currentImageWidth);
    const imageHeight = currentImageHeight && Math.min(Dimensions.get("window").height, currentImageHeight);

    return (
      <View
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.90)" }}
        onLayout={() => {
          this.setState({
            viewport: {
              height: Dimensions.get("window").height,
              width: Dimensions.get("window").width
            }
          });
        }}
      >
        <StatusBar backgroundColor="rgba(0,0,0,0.90)" barStyle="light-content" />
        <RNCarousel
          data={images}
          renderItem={({
            item,
            index
          }: {
            item: { src: ImageURISource; alt: string; linkTo?: string };
            index: number;
          }) => (
            <ScrollView 
              key={index}
              scrollEnabled={false}
              contentContainerStyle={{
                height: "100%",
                width: Dimensions.get("window").width,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              {imageSizes[index] &&
                <ImageOptional
                  source={item.src}
                  errorComponent={<UnavailableImage />}
                  imageComponent={() => (
                    <Animated.View style={{
                      height: imageHeight,
                      width: imageWidth,
                      transform: [
                        { scale: currentIndex === index ? this.scale : 1 },
                        { translateX: currentIndex === index ? Animated.divide(this.offsetX, this.scale) : 0 },
                        { translateY: currentIndex === index ? Animated.divide(this.offsetY, this.scale) : 0 }
                      ]
                    }}>
                    <PanGestureHandler
                      onGestureEvent={this.onPanGestureEvent()}
                      onHandlerStateChange={this.onPanStateChange}
                      enabled={canPanHorizontal || canPanVertical}
                      ref={imagePan}
                      simultaneousHandlers={imagePinch}
                    >
                      <PinchGestureHandler
                        onGestureEvent={ this.onZoomEvent }
                        onHandlerStateChange={this.onZoomStateChange}
                        ref={imagePinch}
                        simultaneousHandlers={imagePan}
                      >
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
                    </PanGestureHandler>
                    </Animated.View>
                  )}
                />
                
              }
              {item.linkTo &&
                <View
                  style={{
                    bottom: 15,
                    padding: 20,
                    position: "absolute",
                    width: "100%"
                  }}
                >
                  <TouchableOpacity
                    onPress={() => Linking.openURL(item.linkTo)}
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      padding: 10,
                      width: "100%"
                    }}
                  >
                    <Text
                      style={{
                        color: CommonStyles.lightGrey,
                        textAlign: "center",
                        width: "100%"
                      }}
                    >
                      {I18n.t("linkTo")}{" "}
                      <A>
                        {(() => {
                          const matches = item.linkTo.match(
                            // from https://stackoverflow.com/a/8498629/6111343
                            /^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i
                          );
                          return matches && matches[1];
                        })()}
                      </A>
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            </ScrollView>
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
              canPanVertical: false 
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
        <MediaAction iconName="close" action={() => navigation.goBack()}/>
      </View>
    );
  }
}

export default withViewTracking('carousel')(Carousel);
