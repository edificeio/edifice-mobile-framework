/**
 * HtmlConverter
 *
 * All functions and tools to interpret HTML rich content.
 * Basically, HTML content can be turned into a flat text (i.e. without rich content), or translated into a React Native content. (with rich content).
 * Both interpreters use SAX as a HTML parser and return either a string or a JSX Element.
 *
 * The JSX interpreter can ignore some rich content types using his `ignore` and/or his `mode` attribute.
 *
 * Warning : parsing and interpreting are costly, don't overuse it. Be sure to cache the result to be not computed again.
 */

import sax from "sax";

export class HtmlConverter {
  // tslint:disable-next-line:variable-name
  protected _html: string; /// input data
  public get html() {
    return this._html;
  }
  public setHtml(html: string) {
    this._html = html;
    this.processHtml();
  }

  // tslint:disable-next-line:variable-name
  protected _render: any; /// output
  public get render() {
    return this._render;
  }

  protected parser: sax.SAXParser; /// The sax parser

  protected getParsingEventHandlers() {
    return {
      onclosetag: (tagName: string) => {
        // console.warn("TAG CLOSE : /" + tagName + " !!! " + Math.random());
        return tagName;
      },
      onend: () => {
        // console.warn("EOF");
      },
      onerror: (err: Error) => {
        // console.warn("Error parsing html", err + " !!! " + Math.random());
        this.parser.error = null;
        this.parser.resume();
      },
      onopentag: (tag: sax.Tag) => {
        // console.warn("TAG OPEN : " + tag.name + " !!! " + Math.random());
        return tag;
      },
      ontext: (text: string) => {
        text = text.replace(/\u200B/g, ""); // remowe ZWSP (Zero-Width SPace) fucking character !
        if (text.match(/\S/)) return text; // Filter whitespace-only strings.
        return null;
      }
    };
  }

  public constructor(html: string) {
    this._html = "<body>" + html + "</body>"; // html code MUST have a root element. // TODO : use a boolean to know of the <body> tag is already present.
    this.initSaxParser();
    // In child class, don't forget to call processHtml() !
  }

  protected postConstruct() {
    // console.warn(this._html);
    this.processHtml();
  }

  protected processHtml() {
    // Implement it in child classed
    throw new Error("HtmlConverter.processHtml() is an abstract method.");
  }

  protected parse() {
    this.parser.write(this.html).close();
  }

  protected initSaxParser() {
    this.parser = sax.parser(false, {
      lowercase: true,
      normalize: true,
      position: false,
      strictEntities: false, // TS-ISSUE : Definitly Typed issue, it does exists in sax
      trim: false
    });
    Object.assign(this.parser, this.getParsingEventHandlers());
  }
}
