import * as React from "react";
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle as RNTextStyle
} from "react-native";
import { CommonStyles } from "../styles/common/styles";

import TextStylePropTypes from "react-native/Libraries/Text/TextStylePropTypes";
import { layoutSize } from "../styles/common/layoutSize";

/**
 * Font weights defined in this font family
 */
export enum FontWeight {
  Normal = "400",
  Light = "200",
  SemiBold = "600",
  Bold = "700"
}

/**
 * Main font properties of Pocket
 */
export const fontFamily = CommonStyles.primaryFontFamily;
export const fontSize = 14;
export const lineHeight = 20;

/**
 * Main text colors
 */
export const TextColor = {
  Action: CommonStyles.actionColor,
  Error: CommonStyles.errorColor,
  Inverse: CommonStyles.white,
  Light: CommonStyles.lightTextColor,
  Normal: CommonStyles.textColor
};

/**
 * Compute font size
 */
export const rem = (ratio: number) => fontSize * ratio;

export type TextProps = RNTextProps & RNTextStyle & { children?: any };

const stylePropNames = Object.keys(TextStylePropTypes);

/**
 * Overloaded Text element. Use it everywhere instead of ReactNative.Text.
 * You can specify css properties as props (textAlign="center" for example).
 *
 * /!\ CAUTION : <Text*> element sets up global text style, so you can't nest it in another <Text*>.
 * Use <NestedText*> instead for all your nested texts (and not the top-level one).
 */
export const Text = (props: TextProps) => {
  return (
    <RNText
      {...props}
      style={{
        color: TextColor.Normal,
        fontFamily,
        fontSize,
        lineHeight,
        ...(props.style as object),
        ...stylePropNames.reduce((acc, key) => {
          if (props[key]) acc[key] = props[key];
          return acc;
        }, {})
      }}
    />
  );
};
export const NestedText = RNText;

export const TextItalic = (props: TextProps) => (
  <Text
    {...props}
    style={{
      fontStyle: "italic",
      ...(props.style as object)
    }}
  />
);
export const NestedTextItalic = (props: TextProps) => (
  <NestedText
    {...props}
    style={{
      fontStyle: "italic",
      ...(props.style as object)
    }}
  />
);

export const TextLight = (props: TextProps) => (
  <Text
    {...props}
    style={{
      fontWeight: FontWeight.Light,
      ...(props.style as object)
    }}
  />
);

export const NestedTextLight = (props: TextProps) => (
  <NestedText
    {...props}
    style={{
      fontWeight: FontWeight.Light,
      ...(props.style as object)
    }}
  />
);

export const TextLightItalic = (props: TextProps) => (
  <TextLight
    {...props}
    style={{
      fontStyle: "italic",
      ...(props.style as object)
    }}
  />
);
export const NestedTextLightItalic = (props: TextProps) => (
  <NestedTextLight
    {...props}
    style={{
      fontStyle: "italic",
      ...(props.style as object)
    }}
  />
);

export const TextSemiBold = (props: TextProps) => (
  <Text
    {...props}
    style={{
      fontWeight: FontWeight.SemiBold,
      ...(props.style as object)
    }}
  />
);

export const NestedTextSemiBold = (props: TextProps) => (
  <NestedText
    {...props}
    style={{
      fontWeight: FontWeight.SemiBold,
      ...(props.style as object)
    }}
  />
);

export const TextSemiBoldItalic = (props: TextProps) => (
  <TextSemiBold
    {...props}
    style={{
      fontStyle: "italic",
      ...(props.style as object)
    }}
  />
);
export const NestedTextSemiBoldItalic = (props: TextProps) => (
  <NestedTextSemiBold
    {...props}
    style={{
      fontStyle: "italic",
      ...(props.style as object)
    }}
  />
);

export const TextBold = (props: TextProps) => (
  <Text
    {...props}
    style={{
      fontWeight: FontWeight.Bold,
      ...(props.style as object)
    }}
  />
);

export const TextBold15 = (props: TextProps) => (
  <Text
    {...props}
    style={{
      fontWeight: FontWeight.Bold,
      fontSize: layoutSize.LAYOUT_15,
      ...(props.style as object)
    }}
  />
);

export const NestedTextBold = (props: TextProps) => (
  <NestedText
    {...props}
    style={{
      fontWeight: FontWeight.Bold,
      ...(props.style as object)
    }}
  />
);

export const TextBoldItalic = (props: TextProps) => (
  <TextBold
    {...props}
    style={{
      fontStyle: "italic",
      ...(props.style as object)
    }}
  />
);
export const NestedTextBoldItalic = (props: TextProps) => (
  <NestedTextBold
    {...props}
    style={{
      fontStyle: "italic",
      ...(props.style as object)
    }}
  />
);

/**
 * Custom text styles
 */

// H1 is a big blue text with vertical margins
export const TextH1 = (props: TextProps) => (
  <TextSemiBold
    {...props}
    style={{
      color: TextColor.Action,
      fontSize: 18,
      marginBottom: 20,
      marginTop: 20,
      ...(props.style as object)
    }}
  />
);

// Link is a just a blue text
export const TextLink = (props: TextProps) => (
  <Text
    {...props}
    style={{
      color: TextColor.Action,
      ...(props.style as object)
    }}
  />
);
export const NestedTextLink = (props: TextProps) => (
  <NestedText
    {...props}
    style={{
      color: TextColor.Action,
      ...(props.style as object)
    }}
  />
);
