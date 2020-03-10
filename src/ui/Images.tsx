import I18n from "i18n-js";

import style from "glamorous-native";
import * as React from "react";
import {
  Dimensions,
  View,
  ViewStyle,
  ImageProps,
  ImageURISource
} from "react-native";
import { withNavigation } from 'react-navigation';

import { Row } from ".";
import { CommonStyles } from "../styles/common/styles";
import { Italic } from "./Typography";
import ImageOptional from "./ImageOptional";
import FastImage from "react-native-fast-image";
import TouchableOpacity from "./CustomTouchableOpacity";

const BubbleText = style.text({
  color: "#FFFFFF",
  marginHorizontal: -10,
  textAlign: "center"
});

const ContainerImage = style.view({});

const SoloImage = style(TouchableOpacity)({
  backgroundColor: "#eeeeee",
  width: "100%"
});

const QuarterImage = style(TouchableOpacity)({
  backgroundColor: "#eeeeee",
  width: "100%"
});

const Overlay = style(TouchableOpacity)({
  backgroundColor: "rgba(0,0,0,0.5)",
  bottom: 0,
  position: "absolute",
  right: 0,
  width: "100%"
});

const Column = style.view({
  justifyContent: "space-between",
  width: "50%"
});

const BubbleView = style.view({
  backgroundColor: "rgba(0,0,0,0.5)",
  borderRadius: 15,
  height: 30,
  left: "50%",
  marginLeft: -10,
  padding: 5,
  position: "absolute",
  width: 30
});

/*const StretchImage = style.image({
  height: "100%",
  width: "100%"
});*/

const UnavailableImage = () => (
  <View
    style={{
      backgroundColor: CommonStyles.entryfieldBorder,
      height: "100%",
      paddingHorizontal: 16,
      paddingVertical: 12,
      width: "100%"
    }}
  >
    <Italic>{I18n.t("imageNotAvailable")}</Italic>
  </View>
);

const StretchImage = (props: ImageProps) => (
  <ImageOptional
    {...props}
    imageComponent={FastImage}
    errorComponent={<UnavailableImage />}
    style={{
      height: "100%",
      width: "100%"
    }}
    resizeMode={FastImage.resizeMode.cover}
  />
);

class Images extends React.Component<
  {
    images: Array<{ src: ImageURISource; alt: string; linkTo?: string }>;
    style?: ViewStyle;
    navigation: any;
  },
  any
> {

  public openImage(startIndex: any) {
    const { images, navigation } = this.props;
    navigation.navigate("carouselModal", { images, startIndex })
  }

  public images() {
    const { width } = Dimensions.get("window");
    const { images } = this.props;

    const heightRatio = width * 0.6;

    if (images.length === 0) return <View />;
    if (images.length === 1) {
      return (
        <SoloImage
          style={{ height: heightRatio }}
          onPress={() => this.openImage(0)}
        >
          <StretchImage source={images[0].src} />
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
              <StretchImage source={images[0].src} />
            </SoloImage>
          </Column>
          <Column style={{ paddingLeft: 5 }}>
            <SoloImage
              style={{ height: heightRatio }}
              onPress={() => this.openImage(1)}
            >
              <StretchImage source={images[1].src} />
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
              <StretchImage source={images[0].src} />
            </SoloImage>
          </Column>
          <Column style={{ paddingLeft: 5 }}>
            <QuarterImage
              style={{ height: heightRatio / 2 - 5 }}
              onPress={() => this.openImage(1)}
            >
              <StretchImage source={images[1].src} />
            </QuarterImage>
            <QuarterImage
              style={{ height: heightRatio / 2 - 5 }}
              onPress={() => this.openImage(2)}
            >
              <StretchImage source={images[2].src} />
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
              <StretchImage source={images[0].src} />
            </QuarterImage>
            <QuarterImage
              style={{ height: heightRatio / 2 - 5 }}
              onPress={() => this.openImage(2)}
            >
              <StretchImage source={images[2].src} />
            </QuarterImage>
          </Column>
          <Column style={{ paddingLeft: 5 }}>
            <QuarterImage
              style={{ height: heightRatio / 2 - 5 }}
              onPress={() => this.openImage(1)}
            >
              <StretchImage source={images[1].src} />
            </QuarterImage>
            <QuarterImage
              style={{ height: heightRatio / 2 - 5 }}
              onPress={() => this.openImage(3)}
            >
              <StretchImage source={images[3].src} />
              {images.length > 4 && (
                <Overlay
                  style={{ height: heightRatio / 2 - 5 }}
                  onPress={() => this.openImage(3)}
                />
              )}
              {images.length > 4 && (
                <BubbleView style={{ bottom: heightRatio / 4 - 15 }}>
                  <BubbleText onPress={() => this.openImage(3)}>
                    +
                    {images.length - 3
                    /* -3 instead of -4 because of the last one has the dark foreground*/
                    }
                  </BubbleText>
                </BubbleView>
              )}
            </QuarterImage>
          </Column>
        </Row>
      );
    }
  }

  public render() {
    const { width } = Dimensions.get("window");
    const heightRatio = width * 0.6;
    const { images, style } = this.props;

    if (images.length === 0) return <View />;
    return (
      <View style={style}>
        <ContainerImage style={{ height: heightRatio }}>
          {this.images()}
        </ContainerImage>
      </View>
    );
  }
}

export default withNavigation(Images)
