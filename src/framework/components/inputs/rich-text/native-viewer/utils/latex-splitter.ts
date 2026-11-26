/**
 * Takes the inline formulas (Tiptap `inline-math` nodes) out of the top-level paragraphs and headings: `EnrichedText`
 * cannot display them, they become `LATEX` segments rendered by `react-native-enriched-markdown`, between the parts of
 * their paragraph. A formula in the middle of a line is displayed on its own line.
 */
import { decode } from 'html-entities';

import { RichContentSegment, RichContentSegmentType } from '~/framework/components/inputs/rich-text/native-viewer/types';

import { getAttributes, ParsedTag, TAG_REGEX, toParsedTag, VOID_TAGS } from './html-tokenizer';

const BLOCK_LATEX_TYPE = 'block-math';
const INLINE_LATEX_TYPE = 'inline-math';
const INLINE_LATEX_REGEX = /data-type\s*=\s*["']inline-math["']/i;
export const LATEX_CONTENT_REGEX = /data-type\s*=\s*["'](?:block|inline)-math\b/i;
// Formulas of other blocks (list items, quotes…) stay in the html: splitting a list would break its bullets and numbers
const SPLIT_BLOCK_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p']);

type SplitPart = string | RichContentSegment;

interface OpenedTag {
  // The opening tag as written in the html, to open it again after a formula
  html: string;
  tagName: string;
}

const getLatex = (attributes: Record<string, string>): string | undefined =>
  decode(attributes['data-latex'] ?? '').trim() || undefined;

// LaTeX of a Tiptap block formula tag (`<div data-type="block-math">`), undefined for any other tag
export const getBlockLatex = (tagName: string, attributes: Record<string, string>): string | undefined =>
  tagName === 'div' && attributes['data-type'] === BLOCK_LATEX_TYPE ? getLatex(attributes) : undefined;

// LaTeX of a Tiptap inline formula tag, undefined for any other tag
export const getInlineLatex = (attributes: Record<string, string>): string | undefined =>
  attributes['data-type'] === INLINE_LATEX_TYPE ? getLatex(attributes) : undefined;

const closeTags = (openedTags: OpenedTag[]) =>
  openedTags
    .map(({ tagName }) => `</${tagName}>`)
    .reverse()
    .join('');

const getFormulaLatex = (tag: ParsedTag): string | undefined =>
  tag.isClosing || VOID_TAGS.has(tag.tagName) ? undefined : getInlineLatex(getAttributes(tag.rawAttributes));

/**
 * Splits a paragraph (`block`: its opening tag, `content`: its inner html) at each of its formulas.
 * The block tag is the first opened tag: each part is a paragraph with the same attributes (alignment…).
 */
const splitBlock = (block: OpenedTag, content: string): SplitPart[] => {
  const parts: SplitPart[] = [];
  const openedTags: OpenedTag[] = [block];
  let partHtml = block.html;
  let textStart = 0;
  // A formula tag is empty: its closing tag is skipped with it
  let isFormulaClosingTagNext = false;
  // The text that follows a formula starts a line: its leading spaces are not displayed
  let isPartStart = false;
  const appendText = (text: string) => {
    const displayedText = isPartStart ? text.trimStart() : text;
    if (displayedText) isPartStart = false;
    partHtml += displayedText;
  };

  for (const match of content.matchAll(TAG_REGEX)) {
    const tag = toParsedTag(match);
    const tagHtml = content.slice(tag.start, tag.end);
    appendText(content.slice(textStart, tag.start));
    textStart = tag.end;
    const latex = getFormulaLatex(tag);
    if (latex) {
      parts.push(partHtml + closeTags(openedTags), { latex, type: RichContentSegmentType.LATEX });
      partHtml = openedTags.map(({ html }) => html).join('');
      isFormulaClosingTagNext = !tag.isSelfClosing;
      isPartStart = true;
    } else if (tag.isClosing && isFormulaClosingTagNext && tag.tagName === 'span') {
      isFormulaClosingTagNext = false;
    } else if (tag.isClosing) {
      partHtml += tagHtml;
      // Index 0 is the block tag, never closed here
      const index = openedTags.map(({ tagName }) => tagName).lastIndexOf(tag.tagName);
      if (index > 0) openedTags.length = index;
    } else {
      partHtml += tagHtml;
      if (!tag.isSelfClosing && !VOID_TAGS.has(tag.tagName)) openedTags.push({ html: tagHtml, tagName: tag.tagName });
    }
  }
  appendText(content.slice(textStart));
  parts.push(partHtml + closeTags(openedTags));
  return parts;
};

/**
 * Splits html (without media blocks) into html parts and the `LATEX` segments of the inline formulas of its top-level
 * paragraphs and headings. Html without inline formula is returned as is.
 */
export const splitInlineLatex = (html: string): SplitPart[] => {
  if (!INLINE_LATEX_REGEX.test(html)) return [html];
  const parts: SplitPart[] = [];
  let depth = 0;
  let htmlStart = 0;
  let block: { contentStart: number; start: number; tagName: string } | undefined;
  for (const match of html.matchAll(TAG_REGEX)) {
    const tag = toParsedTag(match);
    if (tag.isSelfClosing || VOID_TAGS.has(tag.tagName)) continue;
    if (!tag.isClosing) {
      if (depth === 0 && SPLIT_BLOCK_TAGS.has(tag.tagName)) {
        block = { contentStart: tag.end, start: tag.start, tagName: tag.tagName };
      }
      depth += 1;
      continue;
    }
    // The closing tag of the block closes it, with the inline tags left unclosed in it (like browsers do)
    if (block?.tagName !== tag.tagName) {
      depth = Math.max(0, depth - 1);
      continue;
    }
    depth = 0;
    const content = html.slice(block.contentStart, tag.start);
    if (INLINE_LATEX_REGEX.test(content)) {
      const blockTag = { html: html.slice(block.start, block.contentStart), tagName: block.tagName };
      parts.push(html.slice(htmlStart, block.start), ...splitBlock(blockTag, content));
      htmlStart = tag.end;
    }
    block = undefined;
  }
  parts.push(html.slice(htmlStart));
  return parts;
};
