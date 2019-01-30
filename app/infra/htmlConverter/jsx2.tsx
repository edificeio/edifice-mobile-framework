/**
 * HtmlConverterJsx2
 *
 * Interpreter to transform HTML rich content into a JSX Element. (Evolved version)
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
import { Image, Linking, Text, TextStyle, View, ViewStyle } from "react-native";
import WebView from "react-native-android-fullscreen-webview-video";
import sax from "sax";
import { HtmlConverter } from ".";
import Conf from "../../Conf";
import { Loading } from "../../ui";
import { Images } from "../../ui/Images";
import { A, Bold, Italic } from "../../ui/Typography";
import { signImagesUrls, signUrl } from "../oauth";

export interface IHtmlConverterJsxOptions {
  formatting?: boolean;
  hyperlinks?: boolean;
  images?: boolean;
  iframes?: boolean;
  thumbnailSize?: string;
}

// Interfaces for supported HTML Elements

export enum HtmlConverterJsxTextVariant {
  None = 0,
  Bold,
  Italic,
  Link
}

export enum HtmlConverterNuggetTypes {
  Text = 0,
  Images,
  Iframe,
  InlineImage
}

export interface INugget {
  type: HtmlConverterNuggetTypes;
}

export interface ITextNugget extends INugget {
  variant: HtmlConverterJsxTextVariant;
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
  protected hasToInsertLineBreak: number = 0;

  /**
   * If next encountered text nugget should be starting with a space
   */
  protected hasToInsertSpace: boolean = false;

  /**
   * If next encountered text nugget should be starting with a list bullet
   */
  protected hasToInsertBullet: boolean = false;

  /**
   * If next encountered text nugget should be on a upper level of styling (when a text tag has been closed).
   */
  protected hasToExitCurrentTextNugget: boolean = false;

  /**
   * Current deepest Text Nugget. New text encountered is appended in this nugget.
   */
  protected currentTextNugget?: ITextNugget = null;

  /**
   * Array of encountered <span> tags. The array stores a number for each of them to store how many TextNuggets they have generated.
   */
  protected computedTextNuggetsBySpans: number[] = [];

  /**
   * Current ImageNugget (aka image group). Successives <img> tags are grouped in ImageNuggets.
   */
  protected currentImageNugget?: IImagesNugget = null;

  /**
   * Is the next word the first one of his top-level text nugget ?
   */
  protected firstWord: boolean = true;

  /**
   * Current link to url
   */
  protected currentLink?: string = null;

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
    // console.log("input HTML", this._html);
    this._render = [];

    // Now we put all content in a top-level TextNugget, to be sure that we are not going to have sucessing top-level text nuggets.
    // The main top-level will be recreated by restoring textNugget hierarchy when an image or a video is encourntered.
    // Do not you think that's ingenious ? :p
    const allTextWrapper = {
      children: [],
      parent: null,
      type: HtmlConverterNuggetTypes.Text,
      variant: HtmlConverterJsxTextVariant.None
    };
    this.insertNewTextNugget(allTextWrapper);

    // Then, launch parse pass.
    this.parse();
    // console.log("output JSON", this._render);

    // Finally, we build components based on what nuggets we have got.
    this._render = this.renderParse();
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
          case "p":
            this.hasToInsertLineBreak = this.hasToInsertLineBreak || 1;
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
          case "div":
          case "p":
            this.hasToInsertLineBreak = this.hasToInsertLineBreak || 1;
            break;
          case "br":
            this.hasToInsertLineBreak += 1;
            break;
          case "li": {
            this.hasToInsertBullet = true;
            this.hasToInsertLineBreak = this.hasToInsertLineBreak || 1;
            break;
          }
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
   * Parse a text string. If there is not active TextNugget, it will create one and insert it in the render.
   */
  protected parseText(text: string): void {
    if (!text) return; // Don't deal with empty texts (often caused by strange ZWSP chars)

    text = text.replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, " "); // replace new lines by spaces (like in html)

    const leftTrimmedText = text.trimLeft();
    if (text !== leftTrimmedText) {
      text = leftTrimmedText;
      // console.log(`encourtered space at left of :`, text);
      if (!this.firstWord) {
        this.hasToInsertSpace = true;
      }
    }

    if (this.hasToInsertBullet) {
      text = " - " + text;
      this.hasToInsertBullet = false;
    }

    if (this.hasToInsertLineBreak) {
      // console.log(`encourtered line break`);
      if (!this.firstWord) {
        // Insert the new line only if we have some text nuggets before the current text nugget.
        text = "\n".repeat(this.hasToInsertLineBreak) + text;
      }
      this.hasToInsertLineBreak = 0;
    } else if (this.hasToInsertSpace) {
      text = " " + text;
      this.hasToInsertSpace = false;
    }
    if (/\S/.test(text)) {
      // console.log(`encourtered text :`, text);

      const rightTrimmedText = text.trimRight();
      if (text !== rightTrimmedText) {
        text = rightTrimmedText;
        // console.log(`encourtered space at right of :`, text);
        this.hasToInsertSpace = true;
      }

      this.insertNewTextNugget(text);
      this.currentImageNugget = null; // Text breaks image groups (spaces don't count)
      this.firstWord = false;
    }
  }

  /**
   * Parse a opening <span> tag by calling the appropriate open tag method (bold or italic).
   * @param tag sax.Tag
   */
  protected parseOpenSpanTag(tag: sax.Tag): void {
    if (!this.opts.formatting) return;
    let nbComputedNuggets = 0;
    const tagStyle = tag.attributes.style;
    if (tagStyle) {
      if (tagStyle.match(/font-style ?: ?italic/)) {
        this.parseOpenItalicTag(tag);
        ++nbComputedNuggets;
      }
      if (tagStyle.match(/font-weight ?: ?(bold|700)/)) {
        this.parseOpenBoldTag(tag);
        ++nbComputedNuggets;
      }
    }
    this.computedTextNuggetsBySpans.push(nbComputedNuggets);
    /*console.log(
      "encourtered OPEN span that generate",
      nbComputedNuggets,
      "nuggets"
    );*/
  }

  /**
   * Insert the given TextNugget in a new deepness level of text nuggets.
   * NOTE : parent of the given TextNugget has to be null.
   * @param nugget
   */
  protected insertNewTextNugget(nugget: ITextNugget | string) {
    // console.log("insert text nugget :", nugget, "into", this.currentTextNugget);

    if (this.currentTextNugget) {
      // If we're already in a text nugget, append the given one as a child.
      this.currentTextNugget.children.push(nugget);
      if (typeof nugget === "object") {
        // And go into a deeper text level if given nugget is stylized (it's a ITextNugget, not a string)
        (nugget as ITextNugget).parent = this.currentTextNugget;
      }
    } else {
      // If we're on the top-level of nugget tree, we need a ITextNugget.
      // Converts a classic string into a ITextNugget if necessary and put at the end of the rendered tree.

      if (typeof nugget === "string") {
        nugget = {
          children: [nugget],
          parent: null,
          type: HtmlConverterNuggetTypes.Text,
          variant: HtmlConverterJsxTextVariant.None
        };
      }
      this._render.push(nugget);
    }
    // Finally, if we've a given stylized ITextNugget, we need to confirm that we dig in a deeper level of text nuggets.
    if (typeof nugget === "object") {
      this.currentTextNugget = nugget;
    }
  }

  /**
   * Insert the given InlineImageNugget in the current level of text nuggets, and create one if there is isn't an active text nugget.
   * @param nugget
   */
  protected insertInlineImageNugget(nugget: IInlineImageNugget) {
    /*console.log(
      "insert inline image nugget :",
      nugget,
      "into",
      this.currentTextNugget
    );*/

    if (this.hasToInsertSpace) {
      this.insertNewTextNugget(" ");
      this.hasToInsertSpace = false;
    }

    if (this.currentTextNugget) {
      // If we're already in a text nugget, append the given one as a child.
      this.currentTextNugget.children.push(nugget);
    } else {
      // If we're on the top-level of nugget tree, we need a ITextNugget to wrpa it in.
      const textNugget = {
        children: [nugget],
        parent: null,
        type: HtmlConverterNuggetTypes.Text,
        variant: HtmlConverterJsxTextVariant.None
      };
      this._render.push(textNugget);
      this.currentTextNugget = textNugget;
    }
  }

  /**
   * Parse a opening <b> or <strong> tag. Insert an empty styled TextNugget at the deepest level.
   * @param tag sax.Tag
   */
  protected parseOpenBoldTag(tag: sax.Tag): void {
    if (!this.opts.formatting) return;
    // console.log("encourtered OPEN bold");
    this.insertNewTextNugget({
      children: [],
      parent: null,
      type: HtmlConverterNuggetTypes.Text,
      variant: HtmlConverterJsxTextVariant.Bold
    });
  }

  /**
   * Parse a opening <i> or <em> tag. Insert an empty styled TextNugget at the deepest level.
   * @param tag sax.Tag
   */
  protected parseOpenItalicTag(tag: sax.Tag): void {
    if (!this.opts.formatting) return;
    // console.log("encourtered OPEN italic");
    this.insertNewTextNugget({
      children: [],
      parent: null,
      type: HtmlConverterNuggetTypes.Text,
      variant: HtmlConverterJsxTextVariant.Italic
    });
  }

  /**
   * Closes the current TextNugget (at the deepest level). If it has no content, it will be removed.
   */
  protected closeCurrentTextNugget() {
    // console.log("closing text nugget", this.currentTextNugget);
    if (this.currentTextNugget) {
      if (this.currentTextNugget.children.length === 0) {
        // If we have no children, remove it.
        if (this.currentTextNugget.parent) {
          this.currentTextNugget.parent.children.pop(); // Remove the last TextNugget from the parent
        } else {
          this._render.pop(); // It has no parent, remove it from the main render array;
        }
      }
      this.currentTextNugget = this.currentTextNugget.parent; // Close the TextNugget. New children will be put in his parent from now.
    }

    if (this.currentTextNugget === null) {
      // After closing a text nugget, if we are back on the top-level, next word is the first word of his hierarchy
      this.firstWord = true;
      // console.log("first work TRUE");
    }
  }

  /**
   * Parse a closing <b> or <strong> tag.
   */
  protected parseCloseBoldTag(): void {
    if (!this.opts.formatting) return;
    // console.log("encourtered CLOSE bold");
    this.closeCurrentTextNugget();
  }

  /**
   * Parse a closing <i> or <em> tag.
   */
  protected parseCloseItalicTag(): void {
    if (!this.opts.formatting) return;
    // console.log("encourtered CLOSE italic");
    this.closeCurrentTextNugget();
  }

  /**
   * Parse a closing <span> tag, closing each TextNugget it has generated when it was opened.
   */
  protected parseCloseSpanTag(): void {
    if (!this.opts.formatting) return;
    const nbComputedNuggets = this.computedTextNuggetsBySpans.pop();
    for (let i = 0; i < nbComputedNuggets; ++i) {
      this.closeCurrentTextNugget();
    }
    /*console.log(
      "encourtered CLOSE span that generated",
      nbComputedNuggets,
      "nuggets"
    );*/
  }

  /**
   * Parse an opening <a> tag.
   * @param tag sax.Tag
   */
  protected parseOpenLinkTag(tag: sax.Tag): void {
    if (!this.opts.hyperlinks) return;
    // console.log("encourtered OPEN link");
    let cleanUrl = tag.attributes.href;
    if (cleanUrl.startsWith("/")) {
      // Absolute url. We must add the platform domain name manually.
      if (!Conf.currentPlatform) throw new Error("must specify a platform");
      cleanUrl = Conf.currentPlatform.url + cleanUrl;
    }

    const nugget: ILinkTextNugget = {
      children: [],
      parent: null,
      type: HtmlConverterNuggetTypes.Text,
      url: cleanUrl,
      variant: HtmlConverterJsxTextVariant.Link
    };
    this.insertNewTextNugget(nugget);
    this.currentLink = cleanUrl;
  }

  /**
   * Parse a closing <a> tag.
   */
  protected parseCloseLinkTag(): void {
    if (!this.opts.hyperlinks) return;
    // console.log("encourtered CLOSE link");
    this.closeCurrentTextNugget();
    this.currentLink = null;
  }

  /**
   * Append the array-object representation of the render with a new image.
   * This image can create a new image group, or be added to the most recent one.
   * An image group is a INugget of type `Images`  { type: "img", images: [...] }
   * @param tag sax.Tag <img> tag with its src and alt attributes
   */
  protected parseImgTag(tag: sax.Tag): void {
    if (!this.opts.images) return;
    // console.log(`encourtered image : "${tag.attributes}"`);

    // 0 - Check if it's a smiley
    const isEmoji = tag.attributes.class.match(/smiley/);

    if (isEmoji) {
      // console.log("it's a smiley !!");
      // A - 1 - Build image object representation
      const emoji: IInlineImageNugget = {
        alt: tag.attributes.alt,
        src: Conf.currentPlatform.url + tag.attributes.src,
        type: HtmlConverterNuggetTypes.InlineImage
      };
      this.insertInlineImageNugget(emoji);
    } else {
      // B - 1 - Build image object representation
      let src = tag.attributes.src;
      if (src.indexOf("file://") === -1) {
        // TODO : Better parse image url and detect cases
        if (src.indexOf("://") === -1) {
          if (!Conf.currentPlatform) throw new Error("must specify a platform");
          src = Conf.currentPlatform.url + src;
        }
        const split = src.split("?");
        src = split[0] + "?thumbnail=" + this.opts.thumbnailSize;
      }
      const img: IImageComponentAttributes = {
        alt: tag.attributes.alt,
        linkTo: this.currentLink,
        src
      };
      // B - 2 - Detect if we have an active image group
      if (this.currentImageNugget) {
        this.currentImageNugget.images.push(img);
      } else {
        this.currentImageNugget = {
          images: [img],
          type: HtmlConverterNuggetTypes.Images
        };
        this.insertTopLevelNugget(this.currentImageNugget);
      }
    }
  }

  /**
   * Inserts the given nugget at the end on the render representation.
   * This method can be called within a deep-level TextNugget, all TextNugget hierarchy will be restored after the inserted top-level nugget.
   * @param nugget
   */
  protected insertTopLevelNugget(nugget: INugget) {
    // console.log("insert top level nugget");
    let textNuggetsHierarchy: ITextNugget = null;
    let deepestTextNugget: ITextNugget = null;
    // Clear space and line breaks flags
    this.hasToInsertSpace = false;
    this.hasToInsertLineBreak = 0;
    this.firstWord = true;
    // console.log("first work TRUE");

    if (this.currentTextNugget) {
      // Recreate the text nugget hierarchy from deep level to top level
      /*console.log(
        "cloning from deepest current texte nugget",
        this.currentTextNugget
      );*/
      for (
        let cloningNugget = this.currentTextNugget;
        cloningNugget !== null;
        cloningNugget = cloningNugget.parent
      ) {
        // We create each time a new textNugget including the previous one as the only child
        // console.log("clonining", cloningNugget);
        textNuggetsHierarchy = {
          children: textNuggetsHierarchy !== null ? [textNuggetsHierarchy] : [],
          parent: null,
          type: HtmlConverterNuggetTypes.Text,
          variant: cloningNugget.variant
        };
        // We update the only child to store its new parent (if there is a child)
        if (textNuggetsHierarchy.children.length > 0) {
          (textNuggetsHierarchy
            .children[0] as ITextNugget).parent = textNuggetsHierarchy;
        } else {
          // Or we save the deepest text nugget to restore it after
          deepestTextNugget = textNuggetsHierarchy;
          // console.log("deepest cloned", deepestTextNugget);
        }
      }
    }
    // Put the given nugget into the render
    this._render.push(nugget);
    // Restore back the TextNugget hierarchy
    if (textNuggetsHierarchy) {
      this._render.push(textNuggetsHierarchy);
      this.currentTextNugget = deepestTextNugget;
      // console.log("current restorad nugget", this.currentTextNugget);
    }
  }

  /**
   * Append the array-object representation of the render with a new iframe.
   * An iframe representation is an object like { type: "iframe", src: string }
   * @param tag sax.Tag <iframe> tag with its src attribute
   */
  protected parseIframeTag(tag: sax.Tag): void {
    if (!this.opts.iframes) return;

    // console.log(`encourtered iframe : "${tag.attributes}"`);
    // 1 - Build iframe ojbect representation
    let src = tag.attributes.src;
    src = src.startsWith("//") ? "https:" + src : src; // (url starting by "//" won't work in <WebView>, manually add "https" if needed)
    const iframeNugget: IIframeNugget = {
      src,
      type: HtmlConverterNuggetTypes.Iframe
    };
    this.insertTopLevelNugget(iframeNugget);
    this.currentImageNugget = null; // Iframes breaks image groups
  }

  // SECOND CONVERSION STEP -----------------------------------------------------------------------

  /**
   * convert a array-object representation of parsed Html into a JSX representation.
   * This is the second step of conversion in the HtmlConverterJsx. See `parse()` for the first step.
   */
  protected renderParse(): JSX.Element {
    return (
      <View>
        {this._render.map((nugget, index) => {
          // let's put a margin to each element except the first one
          const style = index === 0 ? {} : { marginTop: 15 };

          if (nugget.type === HtmlConverterNuggetTypes.Text) {
            return this.renderParseText(nugget, index, style);
          } else if (nugget.type === HtmlConverterNuggetTypes.Images) {
            return this.renderParseImages(nugget, index, style);
          } else if (nugget.type === HtmlConverterNuggetTypes.Iframe) {
            return this.renderParseIframe(nugget, index, style);
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
  protected renderParseText(
    nugget: ITextNugget | IInlineImageNugget | string,
    key: string,
    style: TextStyle = {}
  ): JSX.Element {
    // 0 - If the text is acually an inline image, render it elsewhere.
    if (
      (nugget as IInlineImageNugget).type ===
      HtmlConverterNuggetTypes.InlineImage
    ) {
      return this.renderParseInlineImage(
        nugget as IInlineImageNugget,
        key,
        style
      );
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
        return this.renderParseText(child, key + "-" + index);
      }
    });

    // 2 - Compute nugget JSX tag
    switch ((nugget as ITextNugget).variant) {
      case HtmlConverterJsxTextVariant.None:
        return (
          <Text key={key} style={style}>
            {children}
          </Text>
        );
      case HtmlConverterJsxTextVariant.Bold:
        return (
          <Bold key={key} style={style}>
            {children}
          </Bold>
        );
      case HtmlConverterJsxTextVariant.Italic:
        return (
          <Italic key={key} style={style}>
            {children}
          </Italic>
        );
      case HtmlConverterJsxTextVariant.Link:
        return (
          <A
            key={key}
            onPress={() => Linking.openURL((nugget as ILinkTextNugget).url)}
          >
            {children}
          </A>
        );
    }
  }

  /**
   * Build JSX <Images> Element from an ImageNugget
   * @param nugget A Top-level ImageNugget.
   * @param key the traditional React key prop
   * @param style
   */
  protected renderParseImages(
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
  protected renderParseInlineImage(
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
  protected renderParseIframe(
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
        />
      </View>
    );
  }
}

export default (html: string, opts?: IHtmlConverterJsxOptions) =>
  new HtmlConverterJsx(html, opts);
