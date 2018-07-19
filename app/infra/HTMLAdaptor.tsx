/**
 * HTMLAdaptor
 *
 * This is a new version of HTMLAdaptator.ts.
 * Takes a HTML string as a parameter and provides many tools to convert it to be used on the React Native application.
 * Parsing is done using [fast-html-parser](https://www.npmjs.com/package/fast-html-parser).
 */

import HTMLParser from "fast-html-parser";
import { Text as RNText, View as RNView } from "react-native";
import { Conf } from "../Conf";

export class HTMLAdaptor {
  private root: Node; // Root node of the parsed html.
  private html: string; // HTML string passed as a parameter.

  public constructor(html: string) {
    this.root = HTMLParser.parse(
      html // Just some first-time fixes...
        .replace(/\r\n/g, "")
        .replace(/<div>\u200B<\/div><div>\u200B<\/div>/g, "")
    );
    this.html = html;
  }

  // EXPORT METHODS

  /**
   * Returns the HTML representation of the node tree as a string.
   * (Yes, it's like HTML to HTML... Doesn't seem very useful.)
   */
  public toHTML(): string {
    return this.outerHTML(this.root);
  }

  /**
   * Convert the HTML representation to a JSX one that works with React Native app.e
   * Also, this conversion make some adaptations of the content :
   * - Groups of <img> are converted to a image mozaic
   * - Almost all text formatting is removed.
   */
  public toReactNative(): JSX.Element {
    const ret = <RNView />;
    // TODO put something here...
    return ret;
  }

  // EXTRACT METHODS

  /**
   * Extract all <img> tags of the node tree, and returns an Array of the src attributes
   */
  public extractImagesSrc(thumbnailSize?: string): Array<{ uri: string }> {
    thumbnailSize = thumbnailSize ? thumbnailSize : "1600x0"; // default value for thumbnailSize
    const paths = [];

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
    }
    return paths;
  }

  /**
   * Returns the structured text (with line breaks, etc...)
   */
  public extractText(): string {
    return (this.root as HTMLParser.HTMLElement).structuredText
      .replace(/\u200b/g, "")
      .replace(/[\s\r\n]+$/, "");
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
    const text = this.extractText();
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

  // PRIVATE METHODS

  /**
   * Export a node to its HTML representation. This function is recursive, the node children are also exported to HTML children.
   * Rewritten from the version taken from HTMLAdaptator.
   * @param node node to export.
   * @returns HTML as a string.
   */
  private outerHTML(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node as Text).wholeText;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const attributes = Object.keys(element.attributes)
        .map(a => a + '="' + element.attributes[a] + '"')
        .join(" ");
      const children = Array.from(element.childNodes).map(cn =>
        this.outerHTML(cn)
      );
      return `<${element.tagName || "div"} ${attributes}>${children.join(
        ""
      )}</${element.tagName || "div"}>`;
    }
  }

  /**
   * Export a node to its React Native JSX representation. This function is recursive, the node children are also exported to JSX children.
   * The conversion take some freedom with certain type of content :
   * - Siblings <img> tags are rendered as a <Images> element with all the images within
   * - Almost all text formatting is removed and replaced by a <Text> element.
   */
  private outerJSX(node: Node): JSX.Element {
    if (node.nodeType === Node.TEXT_NODE)
      return <RNText>{(node as Text).wholeText}</RNText>;
    else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      switch (element.tagName) {

      }
    }
  }
}

export default html => new HTMLAdaptor(html);
