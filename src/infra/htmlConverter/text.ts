/**
 * HtmlConverterText
 *
 * Interpreter to transform HTML rich content into a string. By the way, since the converter returns a string, all rich content is thrown away.
 * Therefore, the interpreter can keep line breaks (this is the case by default).
 *
 * @param html string Input data
 * @param ignoreLineBreaks boolean (default false)
 */
import saxophone from 'saxophone';

import { HtmlConverter } from '.';

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
          case 'div':
          case 'p':
          case 'iframe':
            this.newLine = true;
        }
        return tagName;
      },
      onend: () => commonParsingEventHandlers.onend(),
      onerror: (err: Error) => commonParsingEventHandlers.onerror(err),
      onopentag: (tag: saxophone.Tag) => {
        tag = commonParsingEventHandlers.onopentag(tag);
        switch (tag.name) {
          // after these html tags we have to jump to a new line
          case 'p':
          case 'img':
          case 'hr':
            this.newLine = true;
            break;
          case 'br':
            this._render += this.ignoreLineBreaks ? ' ' : '\n';
        }
        return tag;
      },
      ontext: (text: string) => {
        text = commonParsingEventHandlers.ontext(text);
        if (!text) return '';
        if (this.newLine) {
          this._render += this.ignoreLineBreaks ? ' ' : '\n';
          this.newLine = false;
        }
        text = text.replace(/<\/[a-z]+>/gi, '');
        this._render += text;
        return text;
      },
    };
  }

  public constructor(html: string, ignoreLineBreaks: boolean = false) {
    super(html);
    this.ignoreLineBreaks = ignoreLineBreaks;
    this.postConstruct();
  }

  protected processHtml() {
    this._render = '';
    this.parse();
  }

  public static SHORT_TEXT_MAX_SIZE: number = 64;
  public static SHORT_TEXT_MAX_LINES: number = 2;
  public static NEW_LINE_CHARACTER: string = '\n';
  /**
   * Returns the beginning of text. Text is cut at the `maxLines`th line break and at the `maxSize` character position.
   * This does not cut the text within a word.
   * Add "..." at the end unless text is too short to be cut.
   * Caution: this function is not aware of word-wrapping as it depends on the render procedure, so the text is not guaranted to be displayed under `maxLines` lines.
   * Therefore, it is guaranted to be under `maxSize` chars.
   * @param maxSize max number of characters to keep (default 64)
   * @param maxLines max number of lines ot keep (only if htmlToText has been created with ignoreLineBreaks = false)
   * @param newLineChar force cut after this new line character. (but it can be any character or string you want) (default "\n")
   */
  public getExcerpt(
    maxSize = HtmlConverterText.SHORT_TEXT_MAX_SIZE,
    maxLines = HtmlConverterText.SHORT_TEXT_MAX_LINES,
    newLineChar = HtmlConverterText.NEW_LINE_CHARACTER
  ): { content: string; cropped: boolean } {
    const text = this._render;
    const firstLines = text.split(newLineChar, maxLines);
    let mx = maxSize;
    const nbCharsByLine = maxSize / firstLines.length;
    for (let i = 1; i < firstLines.length; ++i) {
      mx -= nbCharsByLine - (firstLines[i - 1].length % nbCharsByLine) - 1;
    }
    maxSize = mx;
    let trimmedFirstLines = (firstLines.join('\n') + ' ').substr(0, maxSize);
    trimmedFirstLines = trimmedFirstLines.substr(
      0,
      Math.min(trimmedFirstLines.length, Math.max(trimmedFirstLines.lastIndexOf(' '), trimmedFirstLines.lastIndexOf(newLineChar)))
    );
    trimmedFirstLines = trimmedFirstLines.trim();
    const cropped = trimmedFirstLines.length !== text.length;
    if (cropped) trimmedFirstLines += '...';
    return {
      content: trimmedFirstLines,
      cropped,
    };
  }
  public get excerpt() {
    return this.getExcerpt();
  }
}

export default (html: string, ignoreLineBreaks?: boolean) => new HtmlConverterText(html, ignoreLineBreaks);
