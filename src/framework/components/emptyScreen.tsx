/**
 * EmptyScreen
 *
 * Show a large component with an image (bitmap), a title at the top and a little paragraph at the bottom.
 * Used to display a friendly empty screen when there is no data to show.
 */

import * as React from "react";
import { Dimensions, Image, ImageSourcePropType, ViewStyle, View, Text } from "react-native";
import { FlatButton } from "../../ui/FlatButton";
import theme from "../theme";
import { PageView } from "./page";
import { H1 } from "./text";

export const EmptyScreen = ({
  imageSrc,
  imgWidth,
  imgHeight,
  title,
  text,
  scale,
  buttonText,
  buttonAction,
  customStyle
}: {
  imageSrc: ImageSourcePropType;
  imgWidth: number;
  imgHeight: number;
  title: string;
  text: string;
  scale?: number;
  buttonText?: string;
  buttonAction?: () => void;
  customStyle?: ViewStyle;
}) => {
  const { width } = Dimensions.get("window");
  const ratio = imgWidth / imgHeight;
  scale = scale || 0.6;

  return (
    <PageView>
      <View style={[{flex: 1, alignItems: "center", justifyContent: "center"}, customStyle]}>
        <H1
          style={{
            textAlign: "center",
            width: "80%",
            marginTop: 20,
            marginBottom: 20
          }}
        >
          {title}
        </H1>
        <Image
          source={imageSrc}
          resizeMode="contain"
          style={{
            height: scale * (width / ratio),
            width: scale * width
          }}
        />
        <Text
          style={{
            color: theme.color.text.light,
            fontSize: 12,
            textAlign: "center",
            width: "80%",
            marginTop: 20,
            marginBottom: 20
          }}
        >
          {text}
        </Text>
        {buttonText && buttonAction
          ? <FlatButton title={buttonText} onPress={buttonAction}/>
          : null
        }
      </View>
    </PageView>
  );
};
