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
import { Dimensions, Image, ImageSourcePropType, View } from "react-native";
import { PageContainer } from "./ContainerContent";
import { H1, Quote } from "./Typography";

export const EmptyScreen = ({
  imageSrc,
  svgXmlData,
  title,
  text,
  imgWidth,
  imgHeight,
  scale
}: {
  imageSrc?: ImageSourcePropType;
  svgXmlData?: string;
  title?: string;
  text?: string;
  imgWidth: number;
  imgHeight: number;
  scale?: number;
}) => {
  const { width, height } = Dimensions.get("window");
  const ratio = imgWidth / imgHeight;
  scale = scale || 0.6;

  return (
    <PageContainer
      style={{
        alignItems: "center",
        flex: 1,
        justifyContent: "center"
      }}
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
    </PageContainer>
  );
};
