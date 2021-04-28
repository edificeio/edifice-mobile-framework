/**
 * EmptyScreen
 *
 * Show a large component with an image (bitmap), a title at the top and a little paragraph at the bottom.
 * Used to display a friendly empty screen when there is no data to show.
 *
 * Props:
 * imageSrc : source to the image (for bitmaps)
 * title: big blue text at the top
 * text: small grey text at the bottom
 * imgWidth: original image width in pixels
 * imgHeight: original imageHeight in pixels
 * scale: size of the image relative to screen width (defaut 0.6)
 */

import * as React from "react";
import { Dimensions, Image, ImageSourcePropType, ViewStyle } from "react-native";
import { PageContainer } from "./ContainerContent";
import { H1, Quote } from "./Typography";
import { FlatButton } from "./FlatButton";

export const EmptyScreen = ({
  imageSrc,
  // svgXmlData,
  title,
  text,
  imgWidth,
  imgHeight,
  scale,
  buttonText,
  buttonAction,
  customStyle
}: {
  imageSrc?: ImageSourcePropType;
  // svgXmlData?: string;
  title?: string;
  text?: string;
  imgWidth: number;
  imgHeight: number;
  scale?: number;
  buttonText?: string;
  buttonAction?: () => void;
  customStyle?: ViewStyle;
}) => {
  const { width } = Dimensions.get("window");
  const ratio = imgWidth / imgHeight;
  scale = scale || 0.6;

  return (
    <PageContainer
      style={[
        {
          flex: 1,
          alignItems: "center",
          justifyContent: "center"
        },
        customStyle
      ]}
    >
      <H1 style={{ textAlign: "center", width: "80%" }}>{title}</H1>

      <Image
        source={imageSrc}
        style={{
          height: scale * (width / ratio),
          width: scale * width
        }}
        resizeMode="contain"
      />

      <Quote
        style={{
          width: "80%"
        }}
      >
        {text}
      </Quote>

      {buttonAction && buttonText ? <FlatButton
        onPress={buttonAction}
        disabled={false}
        title={buttonText}
        loading={false}
      /> : null}

    </PageContainer>
  );
};
