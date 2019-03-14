/**
 * These tools are used in htmlParser/rn for the second step of parsing.
 * The aim is to render a React Native Element from INugget array.
 */

import I18n from "i18n-js";
import * as React from "react";
import {
  Image,
  Text,
  TextStyle,
  View,
  ViewStyle,
  Linking,
  Platform,
  StatusBar
} from "react-native";
import WebView from "react-native-android-fullscreen-webview-video";
import { Bold, Italic, A, Link } from "../../ui/Typography";
import { Images } from "../../ui/Images";
import { signImagesUrls, signUrl } from "../oauth";
import { Loading } from "../../ui";
import { CommonStyles } from "../../styles/common/styles";

export enum HtmlParserJsxTextVariant {
  None = 0,
  Bold,
  Italic,
  Link
}

export enum HtmlParserNuggetTypes {
  Text = 0,
  Images,
  Iframe,
  InlineImage,
  Audio
}

export interface INugget {
  type: HtmlParserNuggetTypes;
}

export interface ITextNugget extends INugget {
  variant: HtmlParserJsxTextVariant;
  children: Array<ITextNugget | IInlineImageNugget | string>;
  parent?: ITextNugget;
}

export interface ILinkTextNugget extends ITextNugget {
  url: string;
}

export interface IImageComponentAttributes {
  src: string;
  alt: string;
  linkTo?: string;
}

export interface IInlineImageNugget extends INugget {
  src: string;
  alt: string;
}

export interface IImagesNugget extends INugget {
  images: IImageComponentAttributes[];
}

export interface IIframeNugget extends INugget {
  src: string;
}

export interface IAudioNugget extends INugget {
  src: string;
}

// ------------------------------------------------------------------------------------------------

/**
 * convert a array-object representation of parsed Html into a JSX representation.
 * This is the second step of conversion in the HtmlConverterJsx. See `parse()` for the first step.
 */
export function renderNuggets(
  nuggets,
  globalStyles: {
    [HtmlParserNuggetTypes.Text]: {
      all?: TextStyle;
      [HtmlParserJsxTextVariant.None]?: TextStyle;
      [HtmlParserJsxTextVariant.Bold]?: TextStyle;
      [HtmlParserJsxTextVariant.Italic]?: TextStyle;
      [HtmlParserJsxTextVariant.Link]?: TextStyle;
    };
    [HtmlParserNuggetTypes.Images]: ViewStyle;
    [HtmlParserNuggetTypes.Iframe]: ViewStyle;
    [HtmlParserNuggetTypes.Audio]: ViewStyle;
  }
): JSX.Element {
  // console.log("globalStyles", globalStyles);
  return (
    <View>
      {nuggets.map((nugget, index) => {
        // let's put a margin to each element except the first one
        const style = index === 0 ? {} : { marginTop: 15 };

        if (nugget.type === HtmlParserNuggetTypes.Text) {
          return renderParseText(
            nugget,
            index,
            style,
            globalStyles[HtmlParserNuggetTypes.Text]
          );
        } else if (nugget.type === HtmlParserNuggetTypes.Images) {
          return renderParseImages(nugget, index, {
            ...globalStyles[HtmlParserNuggetTypes.Images],
            ...style
          });
        } else if (nugget.type === HtmlParserNuggetTypes.Iframe) {
          return renderParseIframe(nugget, index, {
            ...globalStyles[HtmlParserNuggetTypes.Iframe],
            ...style
          });
        } else if (nugget.type === HtmlParserNuggetTypes.Audio) {
          return renderParseAudio(nugget, index, {
            ...globalStyles[HtmlParserNuggetTypes.Audio],
            ...style
          });
        } else {
          return null;
        }
      })}
    </View>
  );
}

/**
 * Build JSX <Text> Elements hierarchy from a top-level TextNugget.
 * Do not call it with a string as nugget parameter, as it is used to perform a recurvise rendering.
 * The top-level nugget has to be a `ITextNugget`.
 * @param nugget A Top-level TextNugget.
 * @param key the traditional React key prop
 * @param style a style applied to the generated <Text> component.
 */
function renderParseText(
  nugget: ITextNugget | IInlineImageNugget | string,
  key: string,
  style: TextStyle = {},
  textStyles: {
    all?: TextStyle;
    [HtmlParserJsxTextVariant.None]?: TextStyle;
    [HtmlParserJsxTextVariant.Bold]?: TextStyle;
    [HtmlParserJsxTextVariant.Italic]?: TextStyle;
    [HtmlParserJsxTextVariant.Link]?: TextStyle;
  }
): JSX.Element {
  // -1 - Default opts
  textStyles = {
    [HtmlParserJsxTextVariant.Link]: { color: CommonStyles.actionColor },
    ...textStyles
  };
  // console.log("textStyles", textStyles);
  // 0 - If the text is acually an inline image, render it elsewhere.
  if (
    (nugget as IInlineImageNugget).type === HtmlParserNuggetTypes.InlineImage
  ) {
    return renderParseInlineImage(nugget as IInlineImageNugget, key, style);
  }

  if ((nugget as ITextNugget).children.length === 0) {
    // Sometimes (cause of images and other top-level nuggets, top-level text nuggets are empty).
    return null;
  }
  // 1 - Compute recursively all children of nugget
  const children = (nugget as ITextNugget).children.map((child, index) => {
    if (typeof child === "string") {
      return child;
    } else {
      const { all, ...newTextStyles } = textStyles; // Omit global text styles in children text nuggets
      return renderParseText(child, key + "-" + index, {}, newTextStyles);
    }
  });

  // 2 - Compute nugget JSX tag
  switch ((nugget as ITextNugget).variant) {
    case HtmlParserJsxTextVariant.None:
      return (
        <Text key={key} style={{ ...style, ...textStyles.all }}>
          {children}
        </Text>
      );
    case HtmlParserJsxTextVariant.Bold:
      return (
        <Bold
          key={key}
          style={{ ...style, ...textStyles[HtmlParserJsxTextVariant.Bold] }}
        >
          {children}
        </Bold>
      );
    case HtmlParserJsxTextVariant.Italic:
      return (
        <Italic
          key={key}
          style={{ ...style, ...textStyles[HtmlParserJsxTextVariant.Italic] }}
        >
          {children}
        </Italic>
      );
    case HtmlParserJsxTextVariant.Link:
      return (
        <Link
          key={key}
          onPress={() => {
            // console.log("touched", (nugget as ILinkTextNugget).url);
            Linking.openURL((nugget as ILinkTextNugget).url);
          }}
          style={{ ...style, ...textStyles[HtmlParserJsxTextVariant.Link] }}
        >
          {children}
        </Link>
      );
  }
}

/**
 * Build JSX <Images> Element from an ImageNugget
 * @param nugget A Top-level ImageNugget.
 * @param key the traditional React key prop
 * @param style
 */
function renderParseImages(
  nugget: IImagesNugget,
  key: string,
  style: ViewStyle = {}
): JSX.Element {
  return (
    <Images images={signImagesUrls(nugget.images)} key={key} style={style} />
  );
}

/**
 * Build JSX <InlineImage> Element from an InlineImageNugget
 * @param nugget An InlineImageNugget.
 * @param key the traditional React key prop
 * @param style
 */
function renderParseInlineImage(
  nugget: IInlineImageNugget,
  key: string,
  style: ViewStyle = {}
): JSX.Element {
  return (
    <Image
      source={signUrl(nugget.src)}
      style={{
        height: 20,
        width: 20
      }}
      key={key}
    />
  );
}

/**
 * Build JSX <WebView> Element from an IframeNugget
 * @param nugget IHtmlConverterIframeNugget A Top-level IframeNugget.
 * @param key string the traditional React key prop
 * @param style ViewStyle
 */
function renderParseIframe(
  nugget: IIframeNugget,
  key: string,
  style: ViewStyle = {}
): JSX.Element {
  return (
    // `overflow: hidden` prevent a display bug on Android
    <View key={key} style={{ height: 200, ...style, overflow: "hidden" }}>
      <WebView
        style={{ alignSelf: "stretch" }}
        source={{ uri: nugget.src }}
        renderLoading={() => (
          <View
            style={{
              backgroundColor: "#eeeeee",
              height: "100%",
              width: "100%"
            }}
          >
            <Loading />
          </View>
        )}
        startInLoadingState={true}
        scrollEnabled={false}
        useWebKit={true}
        /* On Android, the status bar is by default visible, even when a video is playing fullscreen */
        /* Thanks for the tip, Nabil ! :) */
        {...(Platform.OS === "android"
          ? {
              injectedJavaScript: `
                let isFullscreen = false;
                function check() {
                  if (isFullscreen) {
                    window.postMessage("-fullscreen-off");
                  } else {
                    window.postMessage("-fullscreen-on");
                  }
                  isFullscreen = !isFullscreen;
                }
                document.addEventListener('webkitfullscreenchange', function(e) {
                    check();
                }, false);
                document.addEventListener('mozfullscreenchange', function(e) {
                    check();
                }, false);
                document.addEventListener('fullscreenchange', function(e) {
                    check();
                }, false);
              `,
              onMessage: (data: any) => {
                if (data.nativeEvent.data === "-fullscreen-off")
                  StatusBar.setHidden(false);
                else if (data.nativeEvent.data === "-fullscreen-on")
                  StatusBar.setHidden(true);
              }
            }
          : {})}
      />
    </View>
  );
}

/**
 * Build JSX <Audio> Element from an AudioNugget
 * @param nugget A Top-level AudioNugget.
 * @param key the traditional React key prop
 * @param style
 */
function renderParseAudio(
  nugget: IAudioNugget,
  key: string,
  style: ViewStyle = {}
): JSX.Element {
  return (
    <View
      key={key}
      style={{
        backgroundColor: CommonStyles.entryfieldBorder,
        paddingHorizontal: 16,
        paddingVertical: 12,
        width: "100%",
        ...style
      }}
    >
      <Italic>{I18n.t("soundNotAvailable")}</Italic>
    </View>
  );
}
