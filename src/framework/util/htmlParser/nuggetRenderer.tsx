/**
 * These tools are used in htmlParser/rn for the second step of parsing.
 * The aim is to render a React Native Element from INugget array.
 */
import * as React from 'react';
import { ImageURISource, TextStyle, View, ViewStyle } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import MediaButton from '~/framework/components/media/button';
import {
  BodyItalicText,
  NestedActionText,
  NestedBoldText,
  NestedItalicText,
  NestedText,
  SmallActionText,
  SmallBoldText,
  SmallItalicText,
  SmallText,
} from '~/framework/components/text';
import { openUrl } from '~/framework/util/linking';
import { Image, formatMediaSourceArray, formatSource } from '~/framework/util/media';
import Images from '~/ui/Images';

export enum HtmlParserJsxTextVariant {
  None = 0,
  Bold,
  Italic,
  Link,
  Underline,
  Color,
  BgColor,
}

export enum HtmlParserNuggetTypes {
  Text = 0,
  Images,
  Iframe,
  InlineImage,
  Audio,
  Video,
}

export interface INugget {
  type: HtmlParserNuggetTypes;
}

export interface ITextNugget extends INugget {
  variant: HtmlParserJsxTextVariant;
  children: (ITextNugget | IInlineImageNugget | string)[];
  parent?: ITextNugget;
}

export interface ILinkTextNugget extends ITextNugget {
  url: string | null;
}

export interface IColorTextNugget extends ITextNugget {
  color: string;
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

export interface IVideoNugget extends INugget {
  src: string;
  ratio?: number;
  posterSource?: ImageURISource;
}

// ------------------------------------------------------------------------------------------------

/**
 * convert a array-object representation of parsed Html into a JSX representation.
 * This is the second step of conversion in the HtmlConverterJsx. See `parse()` for the first step.
 */
export function renderNuggets(
  nuggets,
  selectable,
  globalStyles: {
    [HtmlParserNuggetTypes.Text]: {
      all?: TextStyle;
      [HtmlParserJsxTextVariant.None]?: TextStyle;
      [HtmlParserJsxTextVariant.Bold]?: TextStyle;
      [HtmlParserJsxTextVariant.Italic]?: TextStyle;
      [HtmlParserJsxTextVariant.Underline]?: TextStyle;
      [HtmlParserJsxTextVariant.Link]?: TextStyle;
    };
    [HtmlParserNuggetTypes.Images]: ViewStyle;
    [HtmlParserNuggetTypes.Iframe]: ViewStyle;
    [HtmlParserNuggetTypes.Audio]: ViewStyle;
    [HtmlParserNuggetTypes.Video]: ViewStyle;
  },
): JSX.Element {
  return (
    <View>
      {nuggets.map((nugget, index) => {
        // let's put a margin to each element except the first one
        const style = index === 0 ? {} : { marginTop: UI_SIZES.spacing.medium };

        if (nugget.type === HtmlParserNuggetTypes.Text) {
          return renderParseText(nugget, index, style, globalStyles[HtmlParserNuggetTypes.Text], false, selectable);
        } else if (nugget.type === HtmlParserNuggetTypes.Images) {
          return renderParseImages(nugget, index, {
            ...globalStyles[HtmlParserNuggetTypes.Images],
            ...style,
          });
        } else if (nugget.type === HtmlParserNuggetTypes.Iframe) {
          return renderParseIframe(nugget, index, {
            ...globalStyles[HtmlParserNuggetTypes.Iframe],
            ...style,
          });
        } else if (nugget.type === HtmlParserNuggetTypes.Audio) {
          return renderParseAudio(nugget, index, {
            ...globalStyles[HtmlParserNuggetTypes.Audio],
            ...style,
          });
        } else if (nugget.type === HtmlParserNuggetTypes.Video) {
          return renderParseVideo(nugget, index, {
            ...globalStyles[HtmlParserNuggetTypes.Video],
            ...style,
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
    [HtmlParserJsxTextVariant.Underline]?: TextStyle;
    [HtmlParserJsxTextVariant.Link]?: TextStyle;
  },
  nested: boolean = false,
  selectable: boolean = false,
): JSX.Element {
  // -1 - Default opts
  textStyles = {
    [HtmlParserJsxTextVariant.Link]: { color: theme.palette.primary.regular },
    ...textStyles,
  };
  // 0 - If the text is acually an inline image, render it elsewhere.
  if ((nugget as IInlineImageNugget).type === HtmlParserNuggetTypes.InlineImage) {
    return renderParseInlineImage(nugget as IInlineImageNugget, key, style);
  }

  if ((nugget as ITextNugget).children.length === 0) {
    // Sometimes (cause of images and other top-level nuggets, top-level text nuggets are empty).
    return null;
  }
  // 1 - Compute recursively all children of nugget
  const children = (nugget as ITextNugget).children.map((child, index) => {
    if (typeof child === 'string') {
      return child;
    } else {
      const { all, ...newTextStyles } = textStyles; // Omit global text styles in children text nuggets
      return renderParseText(child, key + '-' + index, {}, newTextStyles, true);
    }
  });

  // 2 - Compute nugget JSX tag
  switch ((nugget as ITextNugget).variant) {
    case HtmlParserJsxTextVariant.None:
      const TextComp = nested ? NestedText : SmallText;
      return (
        <TextComp key={key} selectable={selectable} style={{ ...style, ...textStyles.all }}>
          {children}
        </TextComp>
      );
    case HtmlParserJsxTextVariant.Bold:
      const BoldTextComp = nested ? NestedBoldText : SmallBoldText;
      return (
        <BoldTextComp key={key} selectable={selectable} style={{ ...style, ...textStyles[HtmlParserJsxTextVariant.Bold] }}>
          {children}
        </BoldTextComp>
      );
    case HtmlParserJsxTextVariant.Italic:
      const ItalicTextComp = nested ? NestedItalicText : SmallItalicText;
      return (
        <ItalicTextComp key={key} selectable={selectable} style={{ ...style, ...textStyles[HtmlParserJsxTextVariant.Italic] }}>
          {children}
        </ItalicTextComp>
      );
    case HtmlParserJsxTextVariant.Underline:
      const UnderlineTextComp = nested ? NestedText : SmallText;
      return (
        <UnderlineTextComp
          key={key}
          selectable={selectable}
          style={{
            ...style,
            ...textStyles[HtmlParserJsxTextVariant.Underline],
            textDecorationLine: 'underline',
          }}>
          {children}
        </UnderlineTextComp>
      );
    case HtmlParserJsxTextVariant.Link:
      const LinkTextComp = (nugget as ILinkTextNugget).url
        ? nested
          ? NestedActionText
          : SmallActionText
        : nested
        ? NestedText
        : SmallText;
      return (
        <LinkTextComp
          key={key}
          selectable={selectable}
          {...((nugget as ILinkTextNugget).url
            ? {
                onPress: () => {
                  (nugget as ILinkTextNugget).url && openUrl((nugget as ILinkTextNugget).url);
                },
              }
            : {})}
          style={{
            ...style,
            ...textStyles[HtmlParserJsxTextVariant.Link],
          }}>
          {children}
        </LinkTextComp>
      );
    case HtmlParserJsxTextVariant.Color:
      const ColorTextComp = nested ? NestedText : SmallText;
      return (
        <ColorTextComp
          key={key}
          selectable={selectable}
          style={{
            ...style,
            color: (nugget as IColorTextNugget).color,
          }}>
          {children}
        </ColorTextComp>
      );
    case HtmlParserJsxTextVariant.BgColor:
      const BgColorTextComp = nested ? NestedText : SmallText;
      return (
        <BgColorTextComp
          key={key}
          selectable={selectable}
          style={{
            ...style,
            backgroundColor: (nugget as IColorTextNugget).color,
          }}>
          {children}
        </BgColorTextComp>
      );
  }
}

/**
 * Build JSX <Images> Element from an ImageNugget
 * @param nugget A Top-level ImageNugget.
 * @param key the traditional React key prop
 * @param style
 */
function renderParseImages(nugget: IImagesNugget, key: string, style: ViewStyle = {}): JSX.Element {
  return <Images images={formatMediaSourceArray(nugget.images)} key={key} style={style} />;
}

/**
 * Build JSX <InlineImage> Element from an InlineImageNugget
 * @param nugget An InlineImageNugget.
 * @param key the traditional React key prop
 * @param style
 */
function renderParseInlineImage(nugget: IInlineImageNugget, key: string, style: ViewStyle = {}): JSX.Element {
  return (
    <Image
      source={formatSource(nugget.src)}
      style={{
        height: 20,
        width: 20,
      }}
      key={key}
    />
  );
}

/**
 * Build JSX Element from an IframeNugget
 * @param nugget IHtmlConverterIframeNugget A Top-level IframeNugget.
 * @param key string the traditional React key prop
 * @param style ViewStyle
 */
function renderParseIframe(nugget: IIframeNugget, key: string, style: ViewStyle = {}): JSX.Element {
  return (
    <View key={key}>
      <MediaButton type="web" source={formatSource(nugget.src)} />
    </View>
  );
}

/**
 * Build JSX <Audio> Element from an AudioNugget
 * @param nugget A Top-level AudioNugget.
 * @param key the traditional React key prop
 * @param style
 */
function renderParseAudio(nugget: IAudioNugget, key: string, style: ViewStyle = {}): JSX.Element {
  if (!nugget.src) {
    return (
      <BodyItalicText style={{ backgroundColor: theme.palette.grey.cloudy, width: '100%', padding: UI_SIZES.spacing.small }}>
        {I18n.get(`audioNotAvailable`)}
      </BodyItalicText>
    );
  }
  return (
    <View key={key}>
      <MediaButton type="audio" source={formatSource(nugget.src)} style={style} />
    </View>
  );
}

/**
 * Build JSX <Video> Element from an AudioNugget
 * @param nugget A Top-level VideoNugget.
 * @param key the traditional React key prop
 * @param style
 */
function renderParseVideo(nugget: IVideoNugget, key: string, style: ViewStyle = {}): JSX.Element {
  if (!nugget.src) {
    return (
      <BodyItalicText style={{ backgroundColor: theme.palette.grey.cloudy, width: '100%', padding: UI_SIZES.spacing.small }}>
        {I18n.get(`videoNotAvailable`)}
      </BodyItalicText>
    );
  }
  return (
    <View key={key}>
      <MediaButton
        type="video"
        source={formatSource(nugget.src)}
        style={style}
        {...(nugget.ratio ? { ratio: nugget.ratio } : {})}
        {...(nugget.posterSource ? { posterSource: nugget.posterSource } : {})}
      />
    </View>
  );
}
