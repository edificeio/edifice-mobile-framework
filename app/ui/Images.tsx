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
  Platform,
  ViewStyle
} from "react-native";
import { Row, Icon } from ".";
import { StackNavigator } from "react-navigation";
import FitImage from "react-native-fit-image";
import { Carousel } from "./Carousel";

const BubbleText = style.text({
  color: "#FFFFFF",
  textAlign: "center"
});

const ContainerImage = style.view({});

const SoloImage = style.touchableOpacity({
  width: "100%",
  backgroundColor: "#eeeeee"
});

const QuarterImage = style.touchableOpacity({
  width: "100%",
  backgroundColor: "#eeeeee"
});

const Overlay = style.touchableOpacity({
  width: "100%",
  position: "absolute",
  bottom: 0,
  right: 0,
  backgroundColor: "rgba(0,0,0,0.5)"
});

const Column = style.view({
  width: "50%",
  justifyContent: "space-between"
});

const StretchImage = style.image({
  width: "100%",
  height: "100%"
});

export class Images extends React.Component<
  { images: object[]; style?: ViewStyle },
  any
> {
  state = {
    fullscreen: false,
    currentImage: 0
  };

  openImage(index) {
    this.setState({ fullscreen: true, currentImage: index });
  }

  images() {
    const { width, height } = Dimensions.get("window");
    const { images } = this.props;

    const heightRatio = width * 0.6;

    if (images.length === 0) return <View />;
    if (images.length === 1) {
      return (
        <SoloImage
          style={{ height: heightRatio }}
          onPress={() => this.openImage(0)}
        >
          <StretchImage source={images[0]} />
        </SoloImage>
      );
    }
    if (images.length === 2) {
      return (
        <Row style={{ justifyContent: "space-between" }}>
          <Column style={{ paddingRight: 5 }}>
            <SoloImage
              style={{ height: heightRatio }}
              onPress={() => this.openImage(0)}
            >
              <StretchImage source={images[0]} />
            </SoloImage>
          </Column>
          <Column style={{ paddingLeft: 5 }}>
            <SoloImage
              style={{ height: heightRatio }}
              onPress={() => this.openImage(1)}
            >
              <StretchImage source={images[1]} />
            </SoloImage>
          </Column>
        </Row>
      );
    }
    if (images.length === 3) {
      return (
        <Row style={{ justifyContent: "space-between" }}>
          <Column style={{ paddingRight: 5 }}>
            <SoloImage
              style={{ height: heightRatio }}
              onPress={() => this.openImage(0)}
            >
              <StretchImage source={images[0]} />
            </SoloImage>
          </Column>
          <Column style={{ paddingLeft: 5 }}>
            <QuarterImage
              style={{ height: heightRatio / 2 - 5 }}
              onPress={() => this.openImage(1)}
            >
              <StretchImage source={images[1]} />
            </QuarterImage>
            <QuarterImage
              style={{ height: heightRatio / 2 - 5 }}
              onPress={() => this.openImage(2)}
            >
              <StretchImage source={images[2]} />
            </QuarterImage>
          </Column>
        </Row>
      );
    }
    if (images.length >= 4) {
      return (
        <Row style={{ justifyContent: "space-between" }}>
          <Column style={{ paddingRight: 5 }}>
            <QuarterImage
              style={{ height: heightRatio / 2 - 5 }}
              onPress={() => this.openImage(0)}
            >
              <StretchImage source={images[0]} />
            </QuarterImage>
            <QuarterImage
              style={{ height: heightRatio / 2 - 5 }}
              onPress={() => this.openImage(2)}
            >
              <StretchImage source={images[2]} />
            </QuarterImage>
          </Column>
          <Column style={{ paddingLeft: 5 }}>
            <QuarterImage
              style={{ height: heightRatio / 2 - 5 }}
              onPress={() => this.openImage(1)}
            >
              <StretchImage source={images[1]} />
            </QuarterImage>
            <QuarterImage
              style={{ height: heightRatio / 2 - 5 }}
              onPress={() => this.openImage(3)}
            >
              <StretchImage source={images[3]} />
            </QuarterImage>
            {images.length > 4 && (
              <Overlay
                style={{ height: heightRatio / 2 - 5 }}
                onPress={() => this.openImage(3)}
              />
            )}
            {images.length > 4 && (
              <BubbleView style={{ bottom: heightRatio / 4 - 15 }}>
                <BubbleText onPress={() => this.openImage(3)}>
                  +{images.length - 4}
                </BubbleText>
              </BubbleView>
            )}
          </Column>
        </Row>
      );
    }
  }

  public render() {
    const { width, height } = Dimensions.get("window");
    const heightRatio = width * 0.6;

    const { images, style } = this.props;
    if (images.length === 0) return <View />;

    return (
      <View style={style}>
        <ContainerImage style={{ height: heightRatio }}>
          {this.images()}
        </ContainerImage>
        <Carousel
          images={images}
          visible={this.state.fullscreen}
          onClose={() => this.setState({ fullscreen: false })}
          startIndex={this.state.currentImage}
        />
      </View>
    );
  }
}

const BubbleView = style.view({
  position: "absolute",
  backgroundColor: "rgba(0,0,0,0.5)",
  width: 30,
  height: 30,
  padding: 5,
  borderRadius: 15,
  left: "50%",
  marginLeft: -10
});
