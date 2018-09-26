import style from "glamorous-native";
import * as React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Modal,
  Dimensions,
  Animated,
  Platform
} from "react-native";
import { StackNavigator } from "react-navigation";
import FitImage from "react-native-fit-image";
import { Icon } from ".";

const Close = style.touchableOpacity({
  height: 40,
  width: 40,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  top: Platform.OS === "ios" ? 20 : 0,
  right: 0
});

export class Carousel extends React.Component<
  {
    images: Array<{ src: object; alt: string }>;
    visible: boolean;
    startIndex?: number;
    onClose: () => void;
  },
  undefined
> {
  carouselRef: any;
  currentScroll = 0;
  previousScroll = 0;
  currentImage = 0;
  root: any;

  scrollToCurrentImage() {
    const { width, height } = Dimensions.get("window");
    let newPosition = this.currentImage * width;
    this.carouselRef.scrollTo({ x: newPosition, animated: true });
  }

  slideToImage(e) {
    const { width, height } = Dimensions.get("window");
    const left = this.previousScroll - this.currentScroll > width / 5;
    const right = this.previousScroll - this.currentScroll < -width / 5;

    let newPosition = Math.floor(this.currentScroll / width) * width;
    if (right) {
      newPosition += width;
    }
    if (newPosition < 0) {
      newPosition = 0;
    }
    if (newPosition > (this.props.images.length - 1) * width) {
      newPosition = (this.props.images.length - 1) * width;
    }
    this.carouselRef.scrollTo({ x: newPosition, animated: true });
    this.previousScroll = newPosition;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.startIndex !== this.currentImage) {
      this.currentImage = nextProps.startIndex || 0;
    }
  }

  render() {
    const { width, height } = Dimensions.get("window");
    return (
      <Modal
        visible={this.props.visible}
        onRequestClose={() => this.setState({ fullscreen: false })}
        transparent={true}
      >
        <View
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.90)" }}
          ref={component => (this.root = component)}
        >
          <ScrollView
            ref={e => (this.carouselRef = e)}
            horizontal={true}
            style={{ flex: 1, flexDirection: "row", height: "100%" }}
            contentContainerStyle={{ justifyContent: "center" }}
            onScroll={e => (this.currentScroll = e.nativeEvent.contentOffset.x)}
            scrollEventThrottle={16}
            onTouchEnd={e => this.slideToImage(e)}
            onContentSizeChange={() => this.scrollToCurrentImage()}
          >
            {this.props.images.map((image, index) => (
              <View style={{ flex: 1, justifyContent: "center" }} key={index}>
                <FitImage
                  resizeMode="contain"
                  style={{ width: width, height: height }}
                  source={image.src}
                />
              </View>
            ))}
          </ScrollView>
          <Close onPress={() => this.props.onClose()}>
            <Icon size={16} color="#ffffff" name="close" />
          </Close>
        </View>
      </Modal>
    );
  }
}
