/**
 * HTMLAdaptor
 *
 * [OBSOLETE] Use htmlConverter modules instead.
 *
 * This is a new version of HTMLAdaptator.ts.
 * Takes a HTML string as a parameter and provides many tools to convert it to be used on the React Native application.
 * Parsing is done using [fast-html-parser](https://www.npmjs.com/package/fast-html-parser).
 */

import style from "glamorous-native";
import * as React from "react";
import {
  Text as RNText,
  View as RNView,
  WebView as RNWebView
} from "react-native";
import sax from "sax";
import { Conf } from "../Conf";
import { Loading } from "../ui";
import { Images } from "../ui/Images";
const { View } = style;

export class HTMLAdaptor {
  private html: string; // HTML string passed as a parameter.
  private parser: sax.SAXParser;
  private render: any;
  private newLine: boolean = false;
  private imageGroup: boolean = false;
  public thumbnailSize: string = "1600x0"; // default value for thumbnailSize

  public constructor(html: string) {
    this.html = "<body>" + html + "</body>"; // The html markup MUST have a root element. // TODO : use a boolean to know of the <body> tag is already present.
    this.parser = sax.parser(false, {
      lowercase: true,
      normalize: true,
      position: false,
      strictEntities: false, // TS-ISSUE: Definitly typed issue, it does exists in sax
      trim: true
    });
    // console.warn(this.html);
  }

  // EXPORT METHODS

  /**
   * Convert the HTML representation to a JSX one that works with React Native app.e
   * Also, this conversion make some adaptations of the content :
   * - Groups of <img> are converted to a image mozaic
   * - Almost all text formatting is removed.
   */
  public toReactNative(): JSX.Element {
    Object.assign(this.parser, this.reactNativeParsingMethods);
    this.render = [];
    this.newLine = true;
    this.parse();
    // console.warn(this.render);
    // Now transform the array in a JSX Element
    return (
      <RNView>
        {this.render.map(elem => {
          if (typeof elem === "string" || elem instanceof String) {
            return <RNText>{elem}</RNText>;
          } else {
            // At this point it's obviously en object with a `type` property.
            if (elem.type === "img") {
              return <Images images={elem.images} />;
            } else if (elem.type === "iframe") {
              return (
                <View style={{ height: 200 }}>
                  <RNWebView
                    style={{ alignSelf: "stretch" }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    source={{ uri: elem.url }}
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
      </RNView>
    );
  }

  /**
   * Returns the structured text (with line breaks, etc...)
   */
  public toText(): string {
    Object.assign(this.parser, this.textParsingMethods);
    this.render = [];
    this.parse();
    return this.render.join("");
  }

  // EXTRACT METHODS

  /**
   * Extract all <img> tags of the node tree, and returns an Array of the src and alt attributes
   */
  public extractImagesSrc(
    thumbnailSize?: string
  ): Array<{ uri: string; alt: string }> {
    thumbnailSize = thumbnailSize ? thumbnailSize : "1600x0"; // default value for thumbnailSize
    const paths = [];
    /*
    // root must be an Element.
    if (this.root.nodeType !== Node.ELEMENT_NODE) return paths;

    const images = (this.root as Element).querySelectorAll("img");

    for (const image of images) {
      let src = image.attributes["src"];
      if (src.indexOf("file://") === -1) {
        src = Conf.platform + src;
        const split = src.split("?");
        src = split[0] + "?thumbnail=" + thumbnailSize;
      }
      paths.push({ uri: src });
    }*/
    return paths;
  }

  /**
   * Returns the beginning of the extractText() result.
   * It cuts the text after the first line-break, or after a certain number of character, without cutting words.
   * Adds "..." at the end if something has been cut.
   * @param maxSize the number of character after which the content will be cut. Default 70.
   * @param newLineChar the character or string which determines the line break. Default is "\n".
   */
  public static SHORT_TEXT_MAX_SIZE: number = 70;
  public static NEW_LINE_CHARACTER: string = "\n";
  public extractTextBeginning(
    maxSize = HTMLAdaptor.SHORT_TEXT_MAX_SIZE,
    newLineChar = HTMLAdaptor.NEW_LINE_CHARACTER
  ): string {
    const text = this.toText();
    const firstLine = text.split(newLineChar, 1)[0];
    let trimmedFirstLine = (firstLine + " ").substr(0, maxSize);
    trimmedFirstLine = trimmedFirstLine.substr(
      0,
      Math.min(trimmedFirstLine.length, trimmedFirstLine.lastIndexOf(" "))
    );
    trimmedFirstLine = trimmedFirstLine.trim();
    if (trimmedFirstLine.length !== text.length) trimmedFirstLine += "...";
    return trimmedFirstLine;
  }

  // PARSER METHODS

  private commonParsingMethods = {
    onclosetag: (tagName: string) => {
      // console.warn("TAG CLOSE : /" + tagName + " !!! " + Math.random());
      switch (tagName) {
        case "div":
        case "br":
        case "p":
        case "img":
        case "iframe":
          this.newLine = true;
      }
    },
    onend: () => {
      // console.warn("EOF");
    },
    onerror: (err: Error) => {
      // console.warn("Error parsing html", err + " !!! " + Math.random());
      this.parser.error = null;
      this.parser.resume();
    },
    onopentag: (tag: { name: string; attributes: any }) => {
      // TODO : put the attributes type
      // console.warn("TAG OPEN : " + tag.name + " !!! " + Math.random());
    },
    ontext: (text: string) => {
      // console.warn("TEXT : " + text + " !!! " + Math.random());
      return text.replace(/\u200B/g, ""); // remowe ZWSP fucking character !
    }
  };

  private reactNativeParsingMethods = {
    onclosetag: (tagName: string) => {
      this.commonParsingMethods.onclosetag(tagName);
      // ...
    },
    onend: this.commonParsingMethods.onend,
    onerror: this.commonParsingMethods.onerror,
    onopentag: (tag: { name: string; attributes: any }) => {
      // TODO : put the attributes type
      this.commonParsingMethods.onopentag(tag);
      if (tag.name === "img") {
        if (this.imageGroup) {
          // in this case we have an image in the current group
          // console.warn("add image to group : " + tag.attributes.src);
          let src = tag.attributes.src;
          if (src.indexOf("file://") === -1) {
            src = Conf.platform + src;
            const split = src.split("?");
            src = split[0] + "?thumbnail=" + this.thumbnailSize;
          }
          this.render[this.render.length - 1].images.push({
            alt: tag.attributes.alt ? tag.attributes.alt : "",
            uri: src
          });
        } else {
          // in the case it's the firs timage in the group
          // console.warn("new image group : " + tag.attributes.src);
          this.imageGroup = true;
          let src = tag.attributes.src;
          if (src.indexOf("file://") === -1) {
            src = Conf.platform + src;
            const split = src.split("?");
            src = split[0] + "?thumbnail=" + this.thumbnailSize;
          }
          this.render.push({
            images: [
              {
                alt: tag.attributes.alt ? tag.attributes.alt : "",
                uri: src
              }
            ],
            type: "img"
          });
        }
      } else if (tag.name === "iframe") {
        this.imageGroup = false;
        const url = tag.attributes.src.startsWith("//")
          ? "https:" + tag.attributes.src
          : tag.attributes.src;
        this.render.push({
          type: "iframe",
          url
        });
      }
    },
    ontext: (text: string) => {
      text = this.commonParsingMethods.ontext(text);
      if (!text) return;
      this.imageGroup = false;
      if (this.newLine) {
        // console.warn("new line : " + text + " !!!" + Math.random());
        this.render.push(text);
      } else {
        // console.warn("add to line : " + text + " !!!" + Math.random());
        this.render[this.render.length - 1] += text;
      }
    }
  };

  private textParsingMethods = {
    onclosetag: (tagName: string) => {
      this.commonParsingMethods.onclosetag(tagName);
    },
    onend: this.commonParsingMethods.onend,
    onerror: this.commonParsingMethods.onerror,
    onopentag: (tag: { name: string; attributes: any }) => {
      // TODO : put the attributes type
      this.commonParsingMethods.onopentag(tag);
    },
    ontext: (text: string) => {
      this.commonParsingMethods.ontext(text);
      if (this.newLine) {
        this.render.push("\n");
        this.newLine = false;
      }
      this.render.push(text);
    }
  };

  private parse() {
    this.parser.write(this.html).close();
  }

  private youtubeId(url: string) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : false;
  }
}

export default html => new HTMLAdaptor(html);
