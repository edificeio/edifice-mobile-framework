/**
 * Light regex tokenizer for ENT rich content: finds the tags of the html and reads their attributes,
 * without building a tree. Shared by the parser, the table builder and the latex splitter.
 */
import { parseAttrs } from '~/utils/attrs';

export const TAG_REGEX = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)(?![a-zA-Z0-9-])((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const BACKGROUND_COLOR_REGEX = /background-color\s*:\s*([^;]+)/i;

// Tags without closing tag: they never have content
export const VOID_TAGS = new Set(['area', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

export interface ParsedTag {
  end: number;
  isClosing: boolean;
  isSelfClosing: boolean;
  rawAttributes: string;
  start: number;
  tagName: string;
}

export const toParsedTag = (match: RegExpExecArray): ParsedTag => {
  const [fullTag, closingSlash, rawTagName, rawAttributes] = match;
  const start = match.index ?? 0;
  return {
    end: start + fullTag.length,
    isClosing: !!closingSlash,
    isSelfClosing: rawAttributes.trim().endsWith('/'),
    rawAttributes,
    start,
    tagName: rawTagName.toLowerCase(),
  };
};

export const getAttributes = (rawAttributes: string): Record<string, string> => {
  try {
    return parseAttrs(rawAttributes.replace(/\/\s*$/, '').trim()) as Record<string, string>;
  } catch {
    // Malformed attributes: ignore them rather than failing the whole render
    return {};
  }
};

// `background-color` of an inline style, as written in the html
export const getBackgroundColor = (style?: string): string | undefined => BACKGROUND_COLOR_REGEX.exec(style ?? '')?.[1].trim();
