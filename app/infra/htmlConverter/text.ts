/**
 * HtmlConverterText
 *
 * Interpreter to transform HTML rich content into a string. By the way, since the converter returns a string, all rich content is thrown away.
 * Therefore, the interpreter can keep line breaks (this is the case by default).
 *
 * @param html string Input data
 * @param ignoreLineBreaks boolean (default false)
 */

import { HtmlConverter } from ".";

export class HtmlConverterText extends HtmlConverter {
  /**
   * should the converted ignore encountered line breaks (by a <br>, other block tags, or \n - \r\n characters)
   */
  private ignoreLineBreaks: boolean;

  /**
   * If next encountered text nugget should be on a new line or not.
   */
  private newLine: boolean = false;

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
          case "img":
          case "iframe":
            this.newLine = true;
        }
        return tagName;
      },
      onend: () => commonParsingEventHandlers.onend(),
      onerror: (err: Error) => commonParsingEventHandlers.onerror(err),
      onopentag: (tag: { name: string; attributes: any }) => {
        // TODO : put the attributes type
        tag = commonParsingEventHandlers.onopentag(tag);
        return tag;
      },
      ontext: (text: string) => {
        text = commonParsingEventHandlers.ontext(text);
        if (this.newLine) {
          console.warn("this is a new line");
          this._render += this.ignoreLineBreaks ? " " : "\n";
          this.newLine = false;
        }
        this._render += text;
        return text;
      }
    };
  }

  public constructor(html: string, ignoreLineBreaks: boolean = false) {
    super(html);
    this.ignoreLineBreaks = ignoreLineBreaks;
    this.processHtml();
  }

  protected processHtml() {
    this._render = "";
    this.parse();
    console.warn(this._render);
  }

  public static SHORT_TEXT_MAX_SIZE: number = 70;
  public static NEW_LINE_CHARACTER: string = "\n";
  public getExcerpt(
    maxSize = HtmlConverterText.SHORT_TEXT_MAX_SIZE,
    newLineChar = HtmlConverterText.NEW_LINE_CHARACTER
  ): string {
    const text = this._render;
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
}

export default (html: string, ignoreLineBreaks: boolean = false) =>
  new HtmlConverterText(html, ignoreLineBreaks);
