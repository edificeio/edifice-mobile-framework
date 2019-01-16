/**
 * HtmlConverterJsx
 *
 * Interpreter to transform HTML rich content into a JSX Element.
 * This converter keeps some rich content like images, video and other iframe elements.
 *
 * @param html string Input data
 * @param opts object conversion options : {
 *    formatting: boolean (default true) bold and italic
 *    hyperlinks: boolean (default true)
 *    images: boolean (default true)
 *    iframes: boolean (default true) videos and other web content
 *    thumbnailSize: string (default "1600x0") thumbnail size for images (useless if images = false)
 * }
 */

import * as React from "react";

import { Linking, Text, View, ViewStyle, WebView } from "react-native";
import { Loading } from "../../ui";
import { Images } from "../../ui/Images";

import { HtmlConverter } from ".";

import sax from "sax";

import Conf from "../../Conf";
import { A, Bold, Italic } from "../../ui/Typography";
import { signImagesUrls } from "../oauth";

export interface IHtmlConverterJsxOptions {
  formatting?: boolean;
  hyperlinks?: boolean;
  images?: boolean;
  iframes?: boolean;
  thumbnailSize?: string;
}

export interface IHtmlConverterImageNugget {
  type: string; // "img"
  images: Array<{ src: string; alt: string; linkTo?: string }>;
}

export interface IHtmlConverterIframeNugget {
  type: string; // "iframe"
  src: string;
}

export type IHtmlConverterTextNugget = string | IHtmlConverterStyledTextNugget;
export interface IHtmlConverterStyledTextNugget {
  style: HtmlConverterJsxTextStyles;
  children: IHtmlConverterTextNugget[];
  parent?: IHtmlConverterStyledTextNugget;
}

export interface IHtmlConverterTextLinkNugget
  extends IHtmlConverterStyledTextNugget {
  url: string;
}

export interface IHtmlConverterTopLevelTextNugget
  extends IHtmlConverterStyledTextNugget {
  type: string; // "text"
}

export enum HtmlConverterJsxTextStyles {
  None = 0,
  Italic,
  Bold,
  Url
}

export class HtmlConverterJsx extends HtmlConverter {
  // CONVERSION OPTIONS & CONSTRUCTION ------------------------------------------------------------

  /**
   * Converter options
   */
  public static defaultOpts: IHtmlConverterJsxOptions = {
    formatting: true,
    hyperlinks: true,
    iframes: true,
    images: true,
    thumbnailSize: "1600x0"
  };
  protected opts: IHtmlConverterJsxOptions;

  /**
   * If next encountered text nugget should be on a new line (insert line-break if necessary)
   */
  protected newLine: boolean = false;

  /**
   * If next encountered text nugget should be on a upper level of styling (when a text tag has been close).
   */
  protected exitCurrentTextNugget: boolean = false;

  /**
   * Stores the before last level text nugget, when we goes deeper with text nuggets. null at top-level.
   */
  protected beforeLastLevelTextNugget: IHtmlConverterStyledTextNugget = null;

  /**
   * Stores the last level text nugget. This is the deepest IHtmlConverterStyledTextNugget (just plain string doesn't count for deep levels).
   */
  protected lastLevelTextNugget: IHtmlConverterStyledTextNugget = null;

  /**
   * Number of non-ignored <span> tag nested at the current parsing advancement.
   */
  protected numberSpanNested: number = 0;

  public constructor(html: string, opts: IHtmlConverterJsxOptions = {}) {
    super(html);
    this.opts = { ...HtmlConverterJsx.defaultOpts, ...opts };
    this.postConstruct();
  }

  /**
   * full stack of conversion.
   */
  protected processHtml() {
    /*
      Okay this is a little tricky. JSX Elements' props are constants, so we can't create one and add a child after.
      To render the JSX Element, we first render an array of parsed content, and than translate it to a JSX tree.
      The parse() method here construct the array, and the renderParse() method convert it to JSX.
      Both of these two methods stores the result in `this.render`, so after conversion, the array representation isn't available anymore.
    */
    // console.warn(this._html);
    this._render = [];
    this.parse();
    // console.warn(this._render);
    this._render = this.renderParse();
  }

  /**
   * Returns the last top-level element in the render array. Plain string doesn't count.
   */
  protected getLastRenderItem(): { type: string } {
    return this._render.length ? this._render[this._render.length - 1] : null;
  }

  /**
   * Returns true or false depending on the type of the last top-level element in render array.
   * @param type string
   */
  protected isLastRenderItemOfType(type: string): boolean {
    return this.getLastRenderItem()
      ? this.getLastRenderItem().type === type
      : false;
  }

  // FIRST CONVERSION STEP ------------------------------------------------------------------------

  protected getParsingEventHandlers() {
    const commonParsingEventHandlers = super.getParsingEventHandlers();
    return {
      onclosetag: (tagName: string) => {
        tagName = commonParsingEventHandlers.onclosetag(tagName);
        switch (tagName) {
          // after these html tags we have to jump to a new line
          case "div":
          case "br":
          case "p":
            this.newLine = true;
            break;
          case "a":
            this.parseCloseLinkTag();
            break;
          case "b":
          case "strong":
            this.parseCloseBoldTag();
            break;
          case "i":
          case "em":
            this.parseCloseItalicTag();
            break;
          case "span":
            this.parseCloseSpanTag();
            break;
        }
        return tagName;
      },
      onend: () => commonParsingEventHandlers.onend(),
      onerror: (err: Error) => commonParsingEventHandlers.onerror(err),
      onopentag: (tag: sax.Tag) => {
        tag = commonParsingEventHandlers.onopentag(tag);

        switch (tag.name) {
          case "img":
            this.parseImgTag(tag);
            break;
          case "iframe":
            this.parseIframeTag(tag);
            break;
          case "a":
            this.parseOpenLinkTag(tag);
            break;
          case "b":
          case "strong":
            this.parseOpenBoldTag(tag);
            break;
          case "i":
          case "em":
            this.parseOpenItalicTag(tag);
            break;
          case "span":
            this.parseOpenSpanTag(tag);
            break;
        }

        return tag;
      },
      ontext: (text: string) => {
        text = commonParsingEventHandlers.ontext(text);
        this.parseText(text);
        return text;
      }
    };
  }

  /**
   * Append the array-object representation of the render with a new image.
   * This image can create a new image group, or be added to the most recent one.
   * An image group is an object like { type: "img", images: [...] }
   * @param tag sax.Tag <img> tag with its src and alt attributes
   */
  protected parseImgTag(tag: sax.Tag): void {
    if (!this.opts.images) return;
    if (this.isLastRenderItemOfType("img")) {
      // If we're already inside an image group, we have to add this image into the group.
      this._render[this.render.length - 1].images.push(
        this.parseImgSrcAlt(tag.attributes.src, tag.attributes.alt)
      );
    } else {
      // Else, we have to start a brand new image group
      this._render.push({
        images: [this.parseImgSrcAlt(tag.attributes.src, tag.attributes.alt)],
        type: "img"
      });
      this.lastLevelTextNugget = null; // Image groups breaks text
    }
  }

  /**
   * Returns an object describing image attributes, like the <Images> component uses it.
   * @param src
   * @param alt
   * @param thumbnailSize
   * @return {alt: string, src: string}
   */
  protected parseImgSrcAlt(
    src: string,
    alt: string = "",
    thumbnailSize: string = this.opts.thumbnailSize
  ): { alt: string; src: string } {
    if (src.indexOf("file://") === -1) {
      // TODO : Better parse image url and detect cases
      if (src.indexOf("://") === -1) {
        if (!Conf.currentPlatform) throw new Error("must specify a platform");
        src = Conf.currentPlatform.url + src;
      }
      const split = src.split("?");
      src = split[0] + "?thumbnail=" + thumbnailSize; // TODO : Optional use of thumbnail
    }
    return { alt, src };
  }

  /**
   * Append the array-object representation of the render with a new iframe.
   * An iframe representation is an object like { type: "iframe", src: string }
   * @param tag sax.Tag <iframe> tag with its src attribute
   */
  protected parseIframeTag(tag: sax.Tag): void {
    if (!this.opts.iframes) return;
    this._render.push({
      src: this.parseIframeSrc(tag.attributes.src),
      type: "iframe"
    });
    this.lastLevelTextNugget = null; // IFrame breaks text
  }

  /**
   * Returns an absolute https correct version of the given url. (url starting by "//" won't work in <WebView>)
   * @param src string
   * @return string
   */
  protected parseIframeSrc(src: string): string {
    return src.startsWith("//") ? "https:" + src : src;
  }

  /**
   * Parse a text string. This will place the text in the right TextNugget (and create one if necessary)
   */
  protected parseText(text: string): void {
    // this.placeTextNugget(this.buildTextNugget(text));
    if (!text) return; // Don't deal with empty texts (often caused by strange ZWSP chars)
    this.placeTextNugget(text);
  }

  /**
   * Parse an opening <a> tag.
   * @param tag sax.Tag
   */
  protected parseOpenLinkTag(tag: sax.Tag): void {
    if (!this.opts.hyperlinks) return;
    const nugget = this.buildLinkNugget(tag.attributes.href);
    this.digTextNugget(nugget);
  }

  /**
   * Parse a closing <a> tag.
   */
  protected parseCloseLinkTag(): void {
    if (!this.opts.hyperlinks) return;
    this.undigTextNugget();
  }

  /**
   * Parse a opening <b> or <strong> tag.
   * @param tag sax.Tag
   */
  protected parseOpenBoldTag(tag: sax.Tag): void {
    if (!this.opts.formatting) return;
    const nugget = this.buildBoldNugget();
    this.digTextNugget(nugget);
  }

  /**
   * Parse a closing <b> or <strong> tag.
   */
  protected parseCloseBoldTag(): void {
    if (!this.opts.formatting) return;
    this.undigTextNugget();
  }

  /**
   * Parse a opening <i> or <em> tag.
   * @param tag sax.Tag
   */
  protected parseOpenItalicTag(tag: sax.Tag): void {
    if (!this.opts.formatting) return;
    const nugget = this.buildItalicNugget();
    this.digTextNugget(nugget);
  }

  /**
   * Parse a closing <i> or <em> tag.
   */
  protected parseCloseItalicTag(): void {
    if (!this.opts.formatting) return;
    this.undigTextNugget();
  }

  /**
   * Parse a opening <span> tag.
   * @param tag sax.Tag
   */
  protected parseOpenSpanTag(tag: sax.Tag): void {
    const tagStyle = tag.attributes.style;
    if (tagStyle) {
      if (tagStyle.match(/font-style ?: ?italic/)) {
        ++this.numberSpanNested;
        if (this.opts.formatting) this.parseOpenItalicTag(tag);
      }
      if (tagStyle.match(/font-weight ?: ?bold/)) {
        ++this.numberSpanNested;
        if (this.opts.formatting) this.parseOpenBoldTag(tag);
      }
    }
  }

  /**
   * Parse a closing <span> tag.
   */
  protected parseCloseSpanTag(): void {
    if (this.numberSpanNested === 0) return;
    if (this.opts.formatting) this.undigTextNugget();
    --this.numberSpanNested;
  }

  /**
   * Append the array-object representation of the render with a text nugget.
   * The text nugget can be placed at the top-level or be deeply placed at the end of the most recent text group.
   * Only a top-level text group has the `type` property.
   * @param tag IHtmlConverterTextNugget
   */
  protected placeTextNugget(nugget: IHtmlConverterTextNugget): void {
    if (!this.lastLevelTextNugget) {
      this.addTopLevelTextNugget(nugget);
    } else {
      this.addLastLevelTextNugget(nugget);
    }
  }

  /**
   * Adds the given TextNugget to the render array, at the top-level.
   * @param nugget IHtmlConverterTextNugget
   */
  protected addTopLevelTextNugget(nugget: IHtmlConverterTextNugget): void {
    // if the nugget is just a string, we need to build a Top-Level text nugget
    if (typeof nugget === "string")
      nugget = this.buildStyledTextNugget(nugget, false);
    this._render.push({ ...nugget, type: "text" });
    this.lastLevelTextNugget = nugget;
    // console.warn("add top level : " + Math.random());
    // console.warn(nugget);
  }

  /**
   * Adds the given TextNugget to the render array, at the last-level.
   * @param nugget IHtmlConverterTextNugget
   */
  protected addLastLevelTextNugget(nugget: IHtmlConverterTextNugget): void {
    if (typeof nugget === "string") nugget = this.buildStringTextNugget(nugget);
    // console.warn("add last level :" + Math.random());
    // console.warn(nugget);
    this.lastLevelTextNugget.children.push(nugget);
  }

  /**
   * Add a new level of nugget at the last-level.
   * @param nugget IHtmlConverterStyledTextNugget
   */
  protected digTextNugget(nugget: IHtmlConverterStyledTextNugget): void {
    nugget.parent = this.lastLevelTextNugget;
    this.lastLevelTextNugget.children.push(nugget);
    this.lastLevelTextNugget = nugget;
    // console.warn("dig nugget : " + Math.random());
    // console.warn(this.lastLevelTextNugget.style);
  }

  /**
   * Go up to the before-last-level of deepness.
   */
  protected undigTextNugget(): void {
    this.lastLevelTextNugget = this.lastLevelTextNugget.parent;
    // console.warn("undig " + Math.random());
  }

  /**
   * Computes a string from input data, adding sometimes a line-break at the start.
   * If no line-break added, the out string is same as the in string.
   * Caution : returns `null` if the input string is empty.
   * @param text string
   * @param addLineBreak boolean should put line-break or ignore it.
   */
  protected buildStringTextNugget(
    text: string,
    addLineBreak: boolean = true
  ): string {
    if (!text) return null; // in some cases `text` is empty.
    if (this.newLine) {
      // console.warn("new line : " + text + " !!!" + Math.random());
      if (addLineBreak) text = "\n" + text;
      this.newLine = false;
    }
    return text;
  }

  /**
   * Build a StyledTextNugget from a string
   * @param text string input string
   * @param addLineBreak boolean should put line-break or ignore it.
   */
  protected buildStyledTextNugget(
    text: string,
    addLineBreak: boolean = true
  ): IHtmlConverterStyledTextNugget {
    text = this.buildStringTextNugget(text, addLineBreak);
    return text
      ? {
          children: [text],
          style: HtmlConverterJsxTextStyles.None
        }
      : null;
  }

  /**
   * Build an empty TextNugget with url style and data
   * @param url string
   */
  protected buildLinkNugget(url: string): IHtmlConverterTextLinkNugget {
    return {
      children: [],
      style: HtmlConverterJsxTextStyles.Url,
      url
    };
  }

  /**
   * Build an empty TextNugget with url style and data
   */
  protected buildBoldNugget(): IHtmlConverterStyledTextNugget {
    return {
      children: [],
      style: HtmlConverterJsxTextStyles.Bold
    };
  }

  /**
   * Build an empty TextNugget with url style and data
   */
  protected buildItalicNugget(): IHtmlConverterStyledTextNugget {
    return {
      children: [],
      style: HtmlConverterJsxTextStyles.Italic
    };
  }

  // SECOND CONVERSION STEP -----------------------------------------------------------------------

  /**
   * convert a array-object representation of parsed Html into a JSX representation.
   * This is the second step of conversion in the HtmlConverterJsx. See `parse()` for the first step.
   */
  protected renderParse(): JSX.Element {
    return (
      <View>
        {this.render.map((elem, index) => {
          // let's put a margin to each element except the last one
          const style =
            this.getLastRenderItem() === elem ? {} : { marginBottom: 15 };

          if (elem.type === "text") {
            return this.renderParseText(elem, index, style);
          } else if (elem.type === "img") {
            return this.renderParseImages(elem, index, style);
          } else if (elem.type === "iframe") {
            return this.renderParseIframe(elem, index, style);
          } else {
            return null;
          }
        })}
      </View>
    );
  }

  /**
   * Build JSX <Text> Elements hierarchy from a top-level TextNugget.
   * @param textNugget IHtmlConverterStyledTextNugget A Top-level TextNugget.
   * @param key string the traditional React key prop
   * @param style ViewStyle
   */
  protected renderParseText(
    textNugget: IHtmlConverterStyledTextNugget,
    key: string,
    style: ViewStyle = {}
  ): JSX.Element {
    const children = textNugget.children.map((child, index) => {
      if (typeof child === "string") {
        return child;
      } else {
        return this.renderParseText(child, key + "-" + index);
      }
    });

    switch (textNugget.style) {
      case HtmlConverterJsxTextStyles.None:
        return (
          <Text key={key} style={style}>
            {children}
          </Text>
        );
      case HtmlConverterJsxTextStyles.Bold:
        return (
          <Bold key={key} style={style}>
            {children}
          </Bold>
        );
      case HtmlConverterJsxTextStyles.Italic:
        return (
          <Italic key={key} style={style}>
            {children}
          </Italic>
        );
      case HtmlConverterJsxTextStyles.Url:
        return (
          <A
            key={key}
            onPress={() =>
              Linking.openURL((textNugget as IHtmlConverterTextLinkNugget).url)
            }
          >
            {children}
          </A>
        );
      default:
        return <Text key={key}>{children}</Text>;
    }
  }

  /**
   * Build JSX <Images> Element from an ImageNugget
   * @param imageNugget IHtmlConverterImageNugget A Top-level ImageNugget.
   * @param key string the traditional React key prop
   * @param style ViewStyle
   */
  protected renderParseImages(
    imageNugget: IHtmlConverterImageNugget,
    key: string,
    style: ViewStyle = {}
  ): JSX.Element {
    return (
      <Images
        images={signImagesUrls(imageNugget.images)}
        key={key}
        style={style}
      />
    );
  }

  /**
   * Build JSX <WebView> Element from an IframeNugget
   * @param iframeNugget IHtmlConverterIframeNugget A Top-level IframeNugget.
   * @param key string the traditional React key prop
   * @param style ViewStyle
   */
  protected renderParseIframe(
    iframeNugget: IHtmlConverterIframeNugget,
    key: string,
    style: ViewStyle = {}
  ): JSX.Element {
    return (
      <View key={key} style={{ height: 200, ...style }}>
        <WebView
          style={{ alignSelf: "stretch" }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          source={{ uri: iframeNugget.src }}
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
        />
      </View>
    );
  }
}

export default (html: string, opts?: IHtmlConverterJsxOptions) =>
  new HtmlConverterJsx(html, opts);
