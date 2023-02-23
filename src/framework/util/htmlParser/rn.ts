/**
 * HTML Parser RN
 * This is a complete new version of the obsolete HtmlConverter JSX.
 *
 * This version of the parser renders React Native elements.
 *
 * options :
 * Inherited from HtmlParserAbstract :
 * - `ignoreClass` An array of classnames that make some tags (and their children) to be ignored by the parser.
 * - `preventZWSP` A boolean that indicates if ZWSP (Zero-Width SPace) charatcers will be removed. Default `true`.
 * - `emptyDiv2Br` A boolean that indicates if an empty div has to be interpreted as a <br/> or not. Default `true`.
 * - `parseEntities` A boolean that indicates if html entities hav to be parsed in text nodes or not. Default `true`.
 *
 * Own options :
 * - `textFormating` (boolean) should basic text formatting (bold, italic) should be emited. Default `true`.
 * - `hyperlinks` (boolean) should hyperlinks (<a> tags) should be interpreted. Default `true`.
 * - `images` (boolean) should images be rendered. Default `true`.
 * - `video` (boolean) should video medias be integrated. Default `true`.
 * - `iframes` (boolean) should iframes be intergrated. Default `true`.
 * - `audio` (boolean) should audio medias be integrated. Default `true`.
 * - `globalTextStyle` (TextStyle) style that will be applied to all rendered <Text> elements.
 * - `linkTextStyle` (TextStyle) additional style applied to text links.
 * - `boldTextStyle` (TextStyle) additional style applied to bold text.
 */
import { TextStyle } from 'react-native';

import { assertSession } from '~/framework/modules/auth/reducer';
import { computeVideoThumbnail } from '~/framework/modules/workspace/service';
import { Platform } from '~/framework/util/appConf';
import { formatSource } from '~/framework/util/media';

import { HtmlParserAbstract, IHtmlParserAbstractOptions, ISaxTagClose, ISaxTagOpen } from './abstract';
import { extractVideoResolution } from './content';
import {
  HtmlParserJsxTextVariant,
  HtmlParserNuggetTypes,
  IAudioNugget,
  IColorTextNugget,
  IIframeNugget,
  IImageComponentAttributes,
  IImagesNugget,
  IInlineImageNugget,
  ILinkTextNugget,
  INugget,
  ITextNugget,
  IVideoNugget,
  renderNuggets,
} from './nuggetRenderer';

export interface IHtmlParserRNOptions extends IHtmlParserAbstractOptions {
  textFormatting?: boolean;
  textColor?: boolean;
  hyperlinks?: boolean;
  images?: boolean;
  iframes?: boolean;
  audio?: boolean;
  video?: boolean;
  ignoreLineBreaks?: boolean;
  globalTextStyle?: TextStyle;
  linkTextStyle?: TextStyle;
  boldTextStyle?: TextStyle;
  selectable?: boolean;
}

export default class HtmlParserRN extends HtmlParserAbstract<JSX.Element | INugget[]> {
  /**
   * Default options values
   */
  public static defaultOpts: IHtmlParserRNOptions = {
    ...HtmlParserAbstract.defaultOpts,
    audio: true,
    video: true,
    globalTextStyle: {},
    hyperlinks: true,
    iframes: true,
    images: true,
    linkTextStyle: {},
    boldTextStyle: {},
    textColor: true,
    textFormatting: true,
    ignoreLineBreaks: false,
    selectable: false,
  };

  /**
   * Provided options
   */
  // Defined in parent class
  // protected opts: IHtmlParserRNOptions = {};

  // ----------------------------------------------------------------------------------------------
  // Parsing internal values

  /**
   * If next encountered text should be on a new line (how many to insert line-breaks)
   */
  protected lineBreaksToInsert: number = 0;

  /**
   * If next encountered text should be starting with a space
   */
  protected hasToInsertSpace: boolean = false;

  /**
   * If next encountered text nugget should be starting with a list bullet. This does store what bullet to use, or `null` if there is no list to render.
   */
  protected hasToInsertBullet: string | null = null;

  /**
   * If next encountered text nugget should be on a upper level of styling (when a text tag has been closed).
   */
  protected hasToExitCurrentTextNugget: boolean = false;

  /**
   * Current deepest Text Nugget. New text encountered is appended in this nugget.
   */
  protected currentTextNugget?: ITextNugget = undefined;

  /**
   * Array of encountered <span> tags. The array stores a number for each of them to store how many TextNuggets they have generated.
   */
  protected computedTextNuggetsBySpans: number[] = [];

  /**
   * Current ImageNugget (aka image group). Successives <img> tags are grouped in ImageNuggets.
   */
  protected currentImageNugget?: IImagesNugget = undefined;

  /**
   * Is the next word the first one of his top-level text nugget ?
   */
  protected firstWord: boolean = true;

  /**
   * Current link to url
   */
  protected currentLink?: string = undefined;

  /**
   * Current div empty -> line break
   */
  protected currentDivIsEmpty?: boolean = true;

  /**
   * Is it the first thing to be parsed ?
   */
  protected veryFirstText: boolean = true;

  /**
   *
   * Current Platform
   */
  protected platform?: Platform = undefined;

  // ----------------------------------------------------------------------------------------------

  public constructor(opts?: IHtmlParserRNOptions) {
    super({ ...HtmlParserRN.defaultOpts, ...opts });
    this.platform = assertSession()?.platform;
  }

  protected beforeParse = (html: string) => {
    this.render = [];
    const allTextWrapper = {
      children: [],
      parent: null,
      type: HtmlParserNuggetTypes.Text,
      variant: HtmlParserJsxTextVariant.None,
    };
    this.insertNewTextNugget(allTextWrapper);
    return html;
  };

  protected didParse = (render: JSX.Element | INugget[]) => {
    const output = renderNuggets(render, this.opts.selectable, {
      [HtmlParserNuggetTypes.Text]: {
        all: this.opts.globalTextStyle,
        ...(Object.keys(this.opts.linkTextStyle).length ? { [HtmlParserJsxTextVariant.Link]: this.opts.linkTextStyle } : null),
        ...(Object.keys(this.opts.boldTextStyle).length ? { [HtmlParserJsxTextVariant.Bold]: this.opts.boldTextStyle } : null),
      },
      [HtmlParserNuggetTypes.Images]: {},
      [HtmlParserNuggetTypes.Iframe]: {},
      [HtmlParserNuggetTypes.Audio]: {},
      [HtmlParserNuggetTypes.Video]: {},
    }) as any as JSX.Element;
    return output;
  };

  // ----------------------------------------------------------------------------------------------
  // Concrete event handlers

  protected onTagOpen = (tag: ISaxTagOpen) => {
    switch (tag.name) {
      case 'div':
        this.currentDivIsEmpty = true;
      case 'p':
        this.lineBreaksToInsert = this.lineBreaksToInsert || 1;
        break;
      case 'br':
        this.lineBreaksToInsert += 1;
        break;
      case 'li': {
        this.hasToInsertBullet = ' - '; // This is the symbol used as a list bullet
        this.lineBreaksToInsert = this.lineBreaksToInsert || 1;
        break;
      }
      case 'img':
        this.parseImgTag(tag);
        break;
      case 'iframe':
        this.parseIframeTag(tag);
        break;
      case 'a':
        this.parseOpenLinkTag(tag);
        break;
      case 'b':
      case 'strong':
        this.parseOpenBoldTag(tag);
        break;
      case 'i':
      case 'em':
        this.parseOpenItalicTag(tag);
        break;
      case 'u':
        this.parseOpenUnderlineTag(tag);
        break;
      case 'span':
        this.parseOpenSpanTag(tag);
        break;
      case 'audio':
        this.parseAudioTag(tag);
        break;
      case 'video':
        this.parseVideoTag(tag);
        break;
    }
  };

  protected onTagClose = (tag: ISaxTagClose) => {
    switch (tag.name) {
      // after these html tags we have to jump to a new line
      case 'div':
        if (this.currentDivIsEmpty) ++this.lineBreaksToInsert;
      case 'p':
        this.lineBreaksToInsert = this.lineBreaksToInsert || 1;
        break;
      case 'a':
        this.parseCloseLinkTag();
        break;
      case 'b':
      case 'strong':
        this.parseCloseBoldTag();
        break;
      case 'i':
      case 'em':
        this.parseCloseItalicTag();
        break;
      case 'u':
        this.parseCloseUnderlineTag();
        break;
      case 'span':
        this.parseCloseSpanTag();
        break;
    }
  };

  protected onText = (text: { contents: string }) => {
    this.parseText(text.contents);
  };

  // ----------------------------------------------------------------------------------------------
  // Handlers specialisation

  /**
   * Parse a text string. If there is not active TextNugget, it will create one and insert it in the render.
   */
  protected parseText(text: string): void {
    if (!text) return; // Don't deal with empty texts (often caused by strange ZWSP chars)

    //// REVIEWER, BE VERY INDLUGENT WITH THIS FUNC
    //// It is so mindblowing 🤯🤯🤯
    //// You can't handle this
    //// Even me can't handle this

    text = text.replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, ' '); // replace new lines by spaces (like in html)

    if (text.startsWith('.') || text.startsWith(',')) this.hasToInsertSpace = false; //// YEAH MADAFAKA this is the most ugly code i've never wrote !
    const leftTrimmedText = text.trimLeft();
    text =
      leftTrimmedText !== text //// Ternary del muerte ☠
        ? `${this.hasToInsertSpace ? ' ' : ' '}${leftTrimmedText.length ? leftTrimmedText : this.hasToInsertSpace ? '' : ' '}`
        : `${this.hasToInsertSpace ? ' ' : ''}${leftTrimmedText}`;

    //// All the algorithm is to conditionning this member
    //// Are you scared of this ?
    this.hasToInsertSpace = false;
    //// Because I am. 😱

    if (/\S/.test(text)) {
      this.firstWord = false;
    }

    const rightTrimmedText = text.trimRight();
    if (text !== rightTrimmedText) {
      text = rightTrimmedText;
      !this.firstWord && (this.hasToInsertSpace = true);
    }

    if (this.hasToInsertBullet) {
      text = this.hasToInsertBullet + text;
      this.hasToInsertBullet = null;
    }

    if (this.veryFirstText) {
      this.veryFirstText = false;
      this.lineBreaksToInsert = 0;
    }
    if (this.lineBreaksToInsert) {
      if (!this.opts.ignoreLineBreaks && !this.firstWord) {
        // Insert the new line only if we have some text nuggets before the current text nugget.
        text = '\n'.repeat(this.lineBreaksToInsert) + text;
        this.hasToInsertSpace = false;
      }
      this.lineBreaksToInsert = 0;
    }

    if (text.length) {
      this.insertNewTextNugget(text);
      if (/\S/.test(text)) {
        this.currentImageNugget = undefined; // Text breaks image groups (spaces don't count)
        this.currentDivIsEmpty = false;
      }
    }
  }

  /**
   * Parse a opening <span> tag by calling the appropriate open tag method (bold or italic).
   * @param tag sax.Tag
   */
  protected parseOpenSpanTag(tag: ISaxTagOpen): void {
    let nbComputedNuggets = 0;
    const tagStyles = tag.attrs.style ? tag.attrs.style.split(';') : [];
    for (let tagStyle of tagStyles) {
      tagStyle = tagStyle.trim();
      if (this.opts.textFormatting) {
        if (tagStyle.match(/font-style ?: ?italic/)) {
          this.parseOpenItalicTag(tag);
          ++nbComputedNuggets;
        }
        if (tagStyle.match(/font-weight ?: ?(bold|700)/)) {
          this.parseOpenBoldTag(tag);
          ++nbComputedNuggets;
        }
        if (tagStyle.match(/text-decoration ?: ?underline/)) {
          this.parseOpenUnderlineTag(tag);
          ++nbComputedNuggets;
        }
      }
      if (this.opts.textColor) {
        const colormatches = tagStyle.match(/^color ?: ?([^;]+)/);
        if (colormatches) {
          this.parseOpenColorTag(tag, colormatches[1]);
          ++nbComputedNuggets;
        }

        const bgmatches = tagStyle.match(/^background-color ?: ?([^;]+)/);
        if (bgmatches) {
          this.parseOpenBgColorTag(tag, bgmatches[1]);
          ++nbComputedNuggets;
        }
      }
    }
    this.computedTextNuggetsBySpans.push(nbComputedNuggets);
  }

  /**
   * Parse a closing <span> tag, closing each TextNugget it has generated when it was opened.
   */
  protected parseCloseSpanTag(): void {
    if (this.opts.textFormatting || this.opts.textColor) {
      const nbComputedNuggets = this.computedTextNuggetsBySpans.pop();
      for (let i = 0; i < nbComputedNuggets; ++i) {
        this.closeCurrentTextNugget();
      }
    }
  }

  /**
   * Parse a opening <b> or <strong> tag. Insert an empty styled TextNugget at the deepest level.
   * @param tag sax.Tag
   */
  protected parseOpenBoldTag(tag: ISaxTagOpen): void {
    if (!this.opts.textFormatting) return;
    this.insertNewTextNugget({
      children: [],
      parent: null,
      type: HtmlParserNuggetTypes.Text,
      variant: HtmlParserJsxTextVariant.Bold,
    });
  }

  /**
   * Parse a closing <b> or <strong> tag.
   */
  protected parseCloseBoldTag(): void {
    if (!this.opts.textFormatting) return;
    this.closeCurrentTextNugget();
  }

  /**
   * Parse a opening <i> or <em> tag. Insert an empty styled TextNugget at the deepest level.
   * @param tag sax.Tag
   */
  protected parseOpenItalicTag(tag: ISaxTagOpen): void {
    if (!this.opts.textFormatting) return;
    this.insertNewTextNugget({
      children: [],
      parent: null,
      type: HtmlParserNuggetTypes.Text,
      variant: HtmlParserJsxTextVariant.Italic,
    });
  }

  /**
   * Parse a closing <i> or <em> tag.
   */
  protected parseCloseItalicTag(): void {
    if (!this.opts.textFormatting) return;
    this.closeCurrentTextNugget();
  }

  /**
   * Parse a opening <i> or <em> tag. Insert an empty styled TextNugget at the deepest level.
   * @param tag sax.Tag
   */
  protected parseOpenUnderlineTag(tag: ISaxTagOpen): void {
    if (!this.opts.textFormatting) return;
    this.insertNewTextNugget({
      children: [],
      parent: null,
      type: HtmlParserNuggetTypes.Text,
      variant: HtmlParserJsxTextVariant.Underline,
    });
  }

  /**
   * Parse a closing <i> or <em> tag.
   */
  protected parseCloseUnderlineTag(): void {
    if (!this.opts.textFormatting) return;
    this.closeCurrentTextNugget();
  }

  /**
   * Parse an opening <a> tag.
   * @param tag sax.Tag
   */
  protected parseOpenLinkTag(tag: ISaxTagOpen): void {
    // if (!this.opts.hyperlinks) return;
    let cleanUrl = tag.attrs.href;
    if (cleanUrl && cleanUrl.startsWith('/')) {
      // Absolute url. We must add the platform domain name manually.
      if (!this.platform) throw new Error('must specify a platform');
      cleanUrl = this.platform!.url + cleanUrl;
    }

    const nugget: ILinkTextNugget = {
      children: [],
      parent: null,
      type: HtmlParserNuggetTypes.Text,
      url: this.opts.hyperlinks ? cleanUrl : null,
      variant: HtmlParserJsxTextVariant.Link,
    };
    this.insertNewTextNugget(nugget);
    this.currentLink = cleanUrl;
  }

  /**
   * Parse a opening <span> tag that changes background color. Insert an empty styled TextNugget at the deepest level.
   * @param tag sax.Tag
   */
  protected parseOpenBgColorTag(tag: ISaxTagOpen, color: string): void {
    if (!this.opts.textColor) return;
    const nugget: IColorTextNugget = {
      children: [],
      color,
      parent: null,
      type: HtmlParserNuggetTypes.Text,
      variant: HtmlParserJsxTextVariant.BgColor,
    };
    this.insertNewTextNugget(nugget);
  }

  /**
   * Parse a opening <span> tag that changes text color. Insert an empty styled TextNugget at the deepest level.
   * @param tag sax.Tag
   */
  protected parseOpenColorTag(tag: ISaxTagOpen, color: string): void {
    if (!this.opts.textColor) return;
    const nugget: IColorTextNugget = {
      children: [],
      color,
      parent: null,
      type: HtmlParserNuggetTypes.Text,
      variant: HtmlParserJsxTextVariant.Color,
    };
    this.insertNewTextNugget(nugget);
  }

  /**
   * Parse a closing <a> tag.
   */
  protected parseCloseLinkTag(): void {
    // if (!this.opts.hyperlinks) return;
    this.closeCurrentTextNugget();
    this.currentLink = null;
  }

  /**
   * Append the array-object representation of the render with a new image.
   * This image can create a new image group, or be added to the most recent one.
   * An image group is a INugget of type `Images` { type: "img", images: [...] }
   * @param tag sax.Tag <img> tag with its src and alt attributes
   */
  protected parseImgTag(tag: ISaxTagOpen): void {
    if (!this.opts.images) return;

    this.currentDivIsEmpty = false;

    // 0 - Check if it's a smiley
    const isEmoji = tag.attrs.class && tag.attrs.class.match(/smiley/);

    if (isEmoji) {
      // A - 1 - Build image object representation
      const emoji: IInlineImageNugget = {
        alt: tag.attrs.alt,
        src: this.platform! + tag.attrs.src,
        type: HtmlParserNuggetTypes.InlineImage,
      };
      this.insertInlineImageNugget(emoji);
    } else {
      // B - 1 - Build image object representation
      let src = tag.attrs.src ?? tag.attrs['data-mce-src'];
      if (src && src.indexOf('file://') === -1) {
        // TODO : Better parse image url and detect cases
        if (src.indexOf('://') === -1) {
          if (!this.platform) throw new Error('must specify a platform');
          if (!src.startsWith('/')) src = '/' + src;
          src = this.platform!.url + src;
        }
        const split = src.split('?');
        src = split[0];
      }
      const img: IImageComponentAttributes = {
        alt: tag.attrs.alt,
        linkTo: this.currentLink,
        src,
      };
      // B - 2 - Detect if we have an active image group
      if (this.currentImageNugget) {
        this.currentImageNugget.images.push(img);
      } else {
        this.currentImageNugget = {
          images: [img],
          type: HtmlParserNuggetTypes.Images,
        };
        this.insertTopLevelNugget(this.currentImageNugget);
      }
    }
  }

  /**
   * Append the array-object representation of the render with a new iframe.
   * An iframe representation is an object like { type: "iframe", src: string }
   * @param tag sax.Tag <iframe> tag with its src attribute
   */
  protected parseIframeTag(tag: ISaxTagOpen): void {
    if (!this.opts.iframes) return;

    // 1 - Build iframe ojbect representation
    let src = tag.attrs.src;
    if (src) {
      src = src.startsWith('//') ? 'https:' + src : src; // (url starting by "//" won't work in MediaPlayer, manually add "https" if needed)
    }
    const iframeNugget: IIframeNugget = {
      src,
      type: HtmlParserNuggetTypes.Iframe,
    };
    this.insertTopLevelNugget(iframeNugget);
    this.currentImageNugget = null; // Iframes breaks image groups
    this.currentDivIsEmpty = false;
  }

  /**
   * Append the array-object representation of the render with a new audio media.
   * An audio media representation is an object like { type: "audio", src: string }
   * @param tag sax.Tag <audio> tag with its src attribute
   */
  protected parseAudioTag(tag: ISaxTagOpen): void {
    if (!this.opts.audio) return;
    let src = tag.attrs.src;
    if (src && src.indexOf('file://') === -1) {
      // TODO : Better parse audio url and detect cases
      if (src.indexOf('://') === -1) {
        if (!this.platform) throw new Error('must specify a platform');
        src = this.platform!.url + src;
      }
    }
    const audioNugget: IAudioNugget = {
      src,
      type: HtmlParserNuggetTypes.Audio,
    };
    this.insertTopLevelNugget(audioNugget);
    this.currentImageNugget = null; // Audio breaks image groups
    this.currentDivIsEmpty = false;
  }

  /**
   * Append the array-object representation of the render with a new video media.
   * A video media representation is an object like { type: "video", src: string }
   * @param tag sax.Tag <video> tag with its src attribute
   */
  protected parseVideoTag(tag: ISaxTagOpen): void {
    if (!this.opts.video) return;
    // Parse src
    let src = tag.attrs.src;
    if (src && src.indexOf('file://') === -1) {
      // TODO : Better parse video url and detect cases
      if (src.indexOf('://') === -1) {
        if (!this.platform) throw new Error('must specify a platform');
        src = this.platform!.url + src;
      }
    }
    // Parse additional video metadata
    const videoDimensions = tag.attrs['data-video-resolution']
      ? extractVideoResolution(tag.attrs['data-video-resolution'])
      : undefined;
    const videoId = tag.attrs['data-document-id'];
    const videoNugget: IVideoNugget = {
      src,
      type: HtmlParserNuggetTypes.Video,
      ...(videoDimensions && videoDimensions[1] !== 0 ? { ratio: videoDimensions[0] / videoDimensions[1] } : {}),
      ...(videoId && videoDimensions ? { posterSource: formatSource(computeVideoThumbnail(videoId, videoDimensions)) } : {}),
    };
    this.insertTopLevelNugget(videoNugget);
    this.currentImageNugget = undefined; // Video breaks image groups
    this.currentDivIsEmpty = false;
  }

  // ----------------------------------------------------------------------------------------------
  // Nugget creation

  /**
   * Insert the given TextNugget in a new deepness level of text nuggets.
   * NOTE : parent of the given TextNugget has to be null.
   * @param nugget
   */
  protected insertNewTextNugget(nugget: ITextNugget | string) {
    if (this.currentTextNugget) {
      // If we're already in a text nugget, append the given one as a child.
      this.currentTextNugget.children.push(nugget);
      if (typeof nugget === 'object') {
        // And go into a deeper text level if given nugget is stylized (it's a ITextNugget, not a string)
        (nugget as ITextNugget).parent = this.currentTextNugget;
      }
    } else {
      // If we're on the top-level of nugget tree, we need a ITextNugget.
      // Converts a classic string into a ITextNugget if necessary and put at the end of the rendered tree.

      if (typeof nugget === 'string') {
        nugget = {
          children: [nugget],
          parent: null,
          type: HtmlParserNuggetTypes.Text,
          variant: HtmlParserJsxTextVariant.None,
        };
      }
      (this.render as INugget[]).push(nugget);
    }
    // Finally, if we've a given stylized ITextNugget, we need to confirm that we dig in a deeper level of text nuggets.
    if (typeof nugget === 'object') {
      this.currentTextNugget = nugget;
    }
  }

  /**
   * Insert the given InlineImageNugget in the current level of text nuggets, and create one if there is isn't an active text nugget.
   * @param nugget
   */
  protected insertInlineImageNugget(nugget: IInlineImageNugget) {
    if (this.hasToInsertSpace) {
      this.insertNewTextNugget(' ');
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
        type: HtmlParserNuggetTypes.Text,
        variant: HtmlParserJsxTextVariant.None,
      };
      (this.render as INugget[]).push(textNugget);
      this.currentTextNugget = textNugget;
    }
  }

  /**
   * Closes the current TextNugget (at the deepest level). If it has no content, it will be removed.
   */
  protected closeCurrentTextNugget() {
    if (this.currentTextNugget) {
      if (this.currentTextNugget.children.length === 0) {
        // If we have no children, remove it.
        if (this.currentTextNugget.parent) {
          this.currentTextNugget.parent.children.pop(); // Remove the last TextNugget from the parent
        } else {
          (this.render as INugget[]).pop(); // It has no parent, remove it from the main render array;
        }
      }
      this.currentTextNugget = this.currentTextNugget.parent; // Close the TextNugget. New children will be put in his parent from now.
    }

    if (this.currentTextNugget === null) {
      // After closing a text nugget, if we are back on the top-level, next word is the first word of his hierarchy
      this.firstWord = true;
    }
  }

  /**
   * Inserts the given nugget at the end on the render representation.
   * This method can be called within a deep-level TextNugget, all TextNugget hierarchy will be restored after the inserted top-level nugget.
   * @param nugget
   */
  protected insertTopLevelNugget(nugget: INugget) {
    let textNuggetsHierarchy: ITextNugget = null;
    let deepestTextNugget: ITextNugget = null;
    // Clear space and line breaks flags
    this.hasToInsertSpace = false;
    this.lineBreaksToInsert = 0;
    this.firstWord = true;

    if (this.currentTextNugget) {
      // Recreate the text nugget hierarchy from deep level to top level
      for (let cloningNugget = this.currentTextNugget; cloningNugget !== null; cloningNugget = cloningNugget.parent) {
        // We create each time a new textNugget including the previous one as the only child
        textNuggetsHierarchy = {
          children: textNuggetsHierarchy !== null ? [textNuggetsHierarchy] : [],
          parent: null,
          type: HtmlParserNuggetTypes.Text,
          variant: cloningNugget.variant,
        };
        // We update the only child to store its new parent (if there is a child)
        if (textNuggetsHierarchy.children.length > 0) {
          (textNuggetsHierarchy.children[0] as ITextNugget).parent = textNuggetsHierarchy;
        } else {
          // Or we save the deepest text nugget to restore it after
          deepestTextNugget = textNuggetsHierarchy;
        }
      }
    }
    // Put the given nugget into the render
    (this.render as INugget[]).push(nugget);
    // Restore back the TextNugget hierarchy
    if (textNuggetsHierarchy) {
      (this.render as INugget[]).push(textNuggetsHierarchy);
      this.currentTextNugget = deepestTextNugget;
    }
  }
}
