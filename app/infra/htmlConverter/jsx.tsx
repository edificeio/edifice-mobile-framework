/**
 * HtmlConverterJsx
 *
 * Interpreter to transform HTML rich content into a JSX Element.
 * This converter keeps some rich content like images, video and other iframe elements.
 *
 * @param html string Input data
 * @param opts object conversion options : {
 *    images: boolean (default true)
 *    iframes: boolean (default true) videos and other web content
 *    thumbnailSize: string (default "1600x0") thumbnail size for images
 * }
 */

import * as React from "react";

import { Text, View, WebView } from "react-native";
import { Loading } from "../../ui";
import { Images } from "../../ui/Images";

import { HtmlConverter } from ".";

import sax from "sax";

import { Conf } from "../../Conf";

export interface IHtmlConverterJsxOptions {
  images?: boolean;
  iframes?: boolean;
  thumbnailSize?: string;
}

export interface IHtmlConverterImageNugget {
  type: string; // "img"
  images: Array<{ src: string; alt: string }>;
}

export interface IHtmlConverterIframeNugget {
  type: string; // "iframe"
  src: string;
}

export type IHtmlConverterTextNugget = string | IHtmlConverterStyledTextNugget;
export interface IHtmlConverterStyledTextNugget {
  style: HtmlConverterJsxTextStyles;
  children: IHtmlConverterTextNugget[];
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
    console.warn(this._html);
    this._render = [];
    this.parse();
    console.warn(this._render);
    this._render = this.renderParse();
  }

  /**
   * Returns the last top-level element in the render array.
   */
  protected getLastRenderItem() {
    return this._render.length ? this._render[this._render.length - 1] : null;
  }

  /**
   * Returns true or false depending on the type of the last top-level element in render array.
   * @param type string
   */
  protected isLastRenderItemOfType(type: string) {
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
  protected parseImgTag(tag: sax.Tag) {
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
   * @param src string
   * @param alt string
   * @param thumbnailSize string
   * @return {alt: string, uri: string}
   */
  protected parseImgSrcAlt(
    src: string,
    alt: string = "",
    thumbnailSize: string = this.opts.thumbnailSize
  ) {
    if (src.indexOf("file://") === -1) {
      src = Conf.platform + src;
      const split = src.split("?");
      src = split[0] + "?thumbnail=" + thumbnailSize;
    }
    return { alt, uri: src };
  }

  /**
   * Append the array-object representation of the render with a new iframe.
   * An iframe representation is an object like { type: "iframe", src: string }
   * @param tag sax.Tag <iframe> tag with its src attribute
   */
  protected parseIframeTag(tag: sax.Tag) {
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
  protected parseIframeSrc(src: string) {
    return src.startsWith("//") ? "https:" + src : src;
  }

  /**
   * Parse a text string. This will place the text in the right TextNugget (and create one if necessary)
   */
  protected parseText(text: string) {
    // this.placeTextNugget(this.buildTextNugget(text));
    if (!text) return; // Don't deal with empty texts (often caused by strange ZWSP chars)
    this.placeTextNugget(text);
  }

  /**
   * Parse a opening <a> tag. This will place a nex text nugget at the right place, and create one if necessary.
   * @param tag sax.Tag
   */
  protected parseOpenLinkTag(tag: sax.Tag) {
    /*this.placeTextNugget(
      this.buildLinkNugget(this.parseIframeSrc(tag.attributes.href))
    );*/
  }

  /**
   * Append the array-object representation of the render with a text nugget.
   * The text nugget can be placed at the top-level or be deeply placed at the end of the most recent text group.
   * Only a top-level text group has the `type` property.
   * @param tag IHtmlConverterTextNugget
   */
  protected placeTextNugget(nugget: IHtmlConverterTextNugget) {
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
  protected addTopLevelTextNugget(nugget: IHtmlConverterTextNugget) {
    // if the nugget is just a string, we need to build a Top-Level text nugget
    if (typeof nugget === "string")
      nugget = this.buildStyledTextNugget(nugget, false);
    this._render.push({ ...nugget, type: "text" });
    this.lastLevelTextNugget = nugget;
    console.warn("add top level : " + Math.random());
    console.warn(nugget);
  }

  /**
   * Adds the given TextNugget to the render array, at the last-level.
   * @param nugget IHtmlConverterTextNugget
   */
  protected addLastLevelTextNugget(nugget: IHtmlConverterTextNugget) {
    if (typeof nugget === "string") nugget = this.buildStringTextNugget(nugget);
    console.warn("add last level :" + Math.random());
    console.warn(nugget);
    this.lastLevelTextNugget.children.push(nugget);

    /*if (this.exitCurrentTextNugget) {
      // if we have to exit the current text nugget, we add it to a upper level
      if (!this.beforeLastLevelTextNugget) {
        // This case shouldn't occur.
        console.error("no before last level text nugget to append : " + nugget);
        throw new Error(
          "no before last level text nugget to append : " + nugget
        );
      }
      // this.beforeLastLevelTextNugget.children.push(nugget);
      this.lastLevelTextNugget = this.beforeLastLevelTextNugget;
    } else {
      // else, we have to the last level
      // this.lastLevelTextNugget.children.push(nugget);
    }*/
  }

  protected buildStringTextNugget(text: string, addLineBreak: boolean = true) {
    if (!text) return null; // in some cases `text` is empty.
    if (this.newLine) {
      console.warn("new line : " + text + " !!!" + Math.random());
      if (addLineBreak) text = "\n" + text;
      this.newLine = false;
    }
    return text;
  }

  /**
   * Build a TextNugget from a string
   * @param text string
   */
  protected buildStyledTextNugget(text: string, addLineBreak: boolean = true) {
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
  protected buildLinkNugget(url: string) {
    /*return {
      children: [],
      style: HtmlConverterJsxTextStyles.Url,
      url
    };*/
  }

  // SECOND CONVERSION STEP -----------------------------------------------------------------------

  /**
   * convert a array-object representation of parsed Html into a JSX representation.
   * This is the second step of conversion in the HtmlConverterJsx. See `parse()` for the first step.
   */
  protected renderParse(): JSX.Element {
    return (
      <View>
        {this.render.map(elem => {
          if (elem.type === "text") {
            return this.renderParseText(elem);
          } else {
            // At this point it's obviously en object with a `type` property.
            if (elem.type === "img") {
              return <Images images={elem.images} />;
            } else if (elem.type === "iframe") {
              return (
                <View style={{ height: 200 }}>
                  <WebView
                    style={{ alignSelf: "stretch" }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    source={{ uri: elem.src }}
                    renderLoading={() => <Loading />}
                    startInLoadingState={true}
                    scrollEnabled={false}
                  />
                </View>
              );
            }
            return null;
          }
        })}
      </View>
    );
  }

  protected renderParseText(
    textNugget: IHtmlConverterStyledTextNugget
  ): JSX.Element {
    const style = {}; // TODO detect style and build style object
    return (
      <Text style={style}>
        {textNugget.children.map(child => {
          if (typeof child === "string") {
            return child;
          } else {
            return this.renderParseText(child);
          }
        })}
      </Text>
    );
  }
}

export default (html: string, opts?: IHtmlConverterJsxOptions) =>
  new HtmlConverterJsx(html, opts);
