import { Platform } from 'react-native';

import { decode, encode } from 'html-entities';

import {
  ImageSize,
  RichContentAttachment,
  RichContentImage,
  RichContentPaneType,
  RichContentSegment,
  RichContentSegmentType,
} from '~/framework/components/inputs/rich-text/native-viewer/types';
import { computeVideoThumbnail } from '~/framework/modules/workspace/service';
import { extractVideoResolution } from '~/framework/util/htmlParser/content';

import { getAttributes, getBackgroundColor, ParsedTag, TAG_REGEX, toParsedTag, VOID_TAGS } from './html-tokenizer';
import { getBlockLatex, getInlineLatex, LATEX_CONTENT_REGEX, splitInlineLatex } from './latex-splitter';
import { buildTableSegment } from './table-builder';

const LINK_TAG_REGEX = /<a\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/a>/gi;
const STRIP_TAGS_REGEX = /<[^<>]*>/g;
const MARK_OPENING_TAG_REGEX = /<mark\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
const MARK_CLOSING_TAG_REGEX = /<\/mark\s*>/gi;
// Left in place of an extracted `<img>`, to tell paragraphs emptied by the extraction from real empty lines
const IMAGE_MARKER = '<!--rich-img-->';
const IMAGE_ONLY_PARAGRAPH_REGEX = new RegExp(String.raw`<p\b[^>]*>\s*(?:${IMAGE_MARKER}\s*)+</p>`, 'gi');
const MEDIA_CONTENT_REGEX = /<(?:audio|iframe|img|video)\b|class\s*=\s*["'][^"']*\b(?:attachments|download-attachments)\b/i;
const TABLE_CONTENT_REGEX = /<table\b/i;
// Tiptap math nodes are empty tags that carry their formula in `data-latex`
const EMPTY_SPAN_REGEX = /<span\b((?:[^>"']|"[^"]*"|'[^']*')*)>\s*<\/span\s*>/gi;

export const hasNonTextContent = (html: string): boolean =>
  [MEDIA_CONTENT_REGEX, TABLE_CONTENT_REGEX, LATEX_CONTENT_REGEX].some(regex => regex.test(html));

const WRAPPER_CLASSES: Record<string, RichContentSegmentType> = {
  'attachments': RichContentSegmentType.ATTACHMENTS,
  'audio-wrapper': RichContentSegmentType.AUDIO,
  'download-attachments': RichContentSegmentType.ATTACHMENTS,
  'iframe-wrapper': RichContentSegmentType.IFRAME,
  'video-wrapper': RichContentSegmentType.VIDEO,
};

const MEDIA_TAGS: Record<string, RichContentSegmentType> = {
  audio: RichContentSegmentType.AUDIO,
  iframe: RichContentSegmentType.IFRAME,
  video: RichContentSegmentType.VIDEO,
};

const PANE_TYPES = new Set<string>(Object.values(RichContentPaneType));

const getMediaBlockType = (tagName: string, attributes: Record<string, string>): RichContentSegmentType | undefined => {
  if (MEDIA_TAGS[tagName]) return MEDIA_TAGS[tagName];
  if (tagName !== 'div' || !attributes.class) return undefined;
  const classNames = attributes.class.split(/\s+/);
  const wrapperClass = classNames.find(className => WRAPPER_CLASSES[className]);
  return wrapperClass ? WRAPPER_CLASSES[wrapperClass] : undefined;
};

const getPaneType = (tagName: string, attributes: Record<string, string>): RichContentPaneType | undefined => {
  if (tagName !== 'div' || attributes['data-information-pane'] === undefined) return undefined;
  const type = attributes['data-type'];
  return PANE_TYPES.has(type) ? (type as RichContentPaneType) : RichContentPaneType.INFO;
};

export const getAbsoluteUrl = (url: string, platformUrl?: string): string => {
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/') && platformUrl) return `${platformUrl}${url}`;
  return url;
};

const parseSize = (width?: string, height?: string): ImageSize | undefined => {
  const parsedWidth = width ? Number.parseFloat(width) : Number.NaN;
  const parsedHeight = height ? Number.parseFloat(height) : Number.NaN;
  return parsedWidth > 0 && parsedHeight > 0 ? { height: parsedHeight, width: parsedWidth } : undefined;
};

const findTagAttributes = (html: string, tagNames: string[]): Record<string, string> | undefined => {
  for (const match of html.matchAll(TAG_REGEX)) {
    const [, closingSlash, tagName, rawAttributes] = match;
    if (!closingSlash && tagNames.includes(tagName.toLowerCase())) {
      const attributes = getAttributes(rawAttributes);
      if (attributes.src) return attributes;
    }
  }
  return undefined;
};

const buildMediaSegment = (
  type: RichContentSegmentType,
  blockHtml: string,
  platformUrl?: string,
): RichContentSegment | undefined => {
  switch (type) {
    case RichContentSegmentType.VIDEO: {
      const videoAttributes = findTagAttributes(blockHtml, ['video']);
      const sourceAttributes = findTagAttributes(blockHtml, ['video', 'source']);
      if (!sourceAttributes?.src) return undefined;
      const resolution = videoAttributes?.['data-video-resolution']
        ? extractVideoResolution(videoAttributes['data-video-resolution'])
        : undefined;
      const documentId = videoAttributes?.['data-document-id'];
      return {
        posterUri: documentId ? computeVideoThumbnail(documentId, resolution) : undefined,
        ratio: resolution ? resolution[0] / resolution[1] : undefined,
        src: getAbsoluteUrl(decode(sourceAttributes.src), platformUrl),
        type,
      };
    }
    case RichContentSegmentType.AUDIO: {
      const attributes = findTagAttributes(blockHtml, ['audio', 'source']);
      return attributes?.src ? { src: getAbsoluteUrl(decode(attributes.src), platformUrl), type } : undefined;
    }
    case RichContentSegmentType.IFRAME: {
      const attributes = findTagAttributes(blockHtml, ['iframe']);
      return attributes?.src ? { src: getAbsoluteUrl(decode(attributes.src), platformUrl), type } : undefined;
    }
    case RichContentSegmentType.ATTACHMENTS: {
      const items: RichContentAttachment[] = Array.from(blockHtml.matchAll(LINK_TAG_REGEX))
        .map(([, rawAttributes, innerHtml]) => ({ attributes: getAttributes(rawAttributes), innerHtml }))
        .filter(({ attributes }) => attributes.href)
        .map(({ attributes, innerHtml }) => ({
          href: getAbsoluteUrl(decode(attributes.href), platformUrl),
          mime: attributes['data-content-type'],
          name: decode(innerHtml.replace(STRIP_TAGS_REGEX, '')).trim(),
        }));
      return items.length ? { items, type } : undefined;
    }
    default:
      return undefined;
  }
};

/**
 * Tiptap colored highlights are `<mark>` tags, unknown to `EnrichedText` (the tag is dropped, the color lost).
 * They are converted to `<span style="background-color: …">`, which `EnrichedText` renders as a custom style.
 */
const convertHighlights = (html: string): string =>
  html
    .replace(MARK_OPENING_TAG_REGEX, (_, rawAttributes: string) => {
      const attributes = getAttributes(rawAttributes);
      const color = getBackgroundColor(attributes.style) ?? attributes['data-color'];
      return color ? `<span style="background-color: ${color}">` : '<span>';
    })
    .replace(MARK_CLOSING_TAG_REGEX, '</span>');

/**
 * Tiptap inline formulas are empty `<span data-type="inline-math" data-latex="…">`: `EnrichedText` would display nothing.
 * Formulas left in the html by `splitInlineLatex` (list items, quotes…) are displayed as inline LaTeX code.
 */
const convertInlineLatex = (html: string): string =>
  html.replace(EMPTY_SPAN_REGEX, (spanTag: string, rawAttributes: string) => {
    const latex = getInlineLatex(getAttributes(rawAttributes));
    return latex ? `<code>${encode(latex)}</code>` : spanTag;
  });

/**
 * Workaround for `react-native-enriched-html` 1.2.0 on iOS (`HtmlParser.mm`, `initiallyProcessHtml`): html shorter than
 * 13 characters without whitespaces (the length of `<html></html>`) never reaches the normalizer and is displayed
 * as raw text (ex: `<p>ok</p>`). Wrapped in `<html>`, it is parsed as the library's own html instead.
 * Android has no such length check. To remove once fixed upstream.
 * See https://github.com/software-mansion/react-native-enriched-html/issues/811
 */
const IOS_MIN_PARSED_HTML_LENGTH = 13;
const toParsableHtml = (html: string): string =>
  Platform.OS === 'ios' && html.replace(/\s/g, '').length < IOS_MIN_PARSED_HTML_LENGTH ? `<html>${html}</html>` : html;

const pushEnrichedHtmlSegment = (segments: RichContentSegment[], rawHtml: string) => {
  // Formulas are converted first: a list item that only contains a formula has no text before the conversion
  const html = convertInlineLatex(rawHtml);
  // Skip segments that only contain empty markup (ex: left between two media blocks)
  const hasText = html.replace(STRIP_TAGS_REGEX, '').replace(/&nbsp;|\s|\u200B/g, '').length > 0;
  if (hasText) segments.push({ html: toParsableHtml(convertHighlights(html)), type: RichContentSegmentType.HTML });
};

const pushHtmlSegment = (segments: RichContentSegment[], rawHtml: string) => {
  // A `<p>` that only contained images would be rendered as an empty line by EnrichedText: remove it.
  // Other empty paragraphs are kept: they are the empty lines typed by the user.
  const html = rawHtml.replace(IMAGE_ONLY_PARAGRAPH_REGEX, '').replaceAll(IMAGE_MARKER, '');
  splitInlineLatex(html).forEach(part =>
    typeof part === 'string' ? pushEnrichedHtmlSegment(segments, part) : segments.push(part),
  );
};

// Images rendered outside of `EnrichedText`: its native loaders cannot authenticate requests (no header, no cookie)
const getAuthenticatedImage = (rawAttributes: string, platformUrl?: string): RichContentImage | undefined => {
  const attributes = getAttributes(rawAttributes);
  if (!attributes.src || attributes.src.startsWith('data:')) return undefined;
  return { declaredSize: parseSize(attributes.width, attributes.height), src: getAbsoluteUrl(decode(attributes.src), platformUrl) };
};

// Elements to identify the currently open block to skip its content until its closing tag
interface SplitState {
  html: string;
  latexBlock?: { depth: number; latex: string; start: number };
  mediaBlock?: { depth: number; start: number; tagName: string; type: RichContentSegmentType };
  paneBlock?: { contentStart: number; depth: number; start: number; type: RichContentPaneType };
  tableBlock?: { contentStart: number; depth: number; start: number };
  pendingHtml: string;
  pendingImages: RichContentImage[];
  platformUrl?: string;
  segments: RichContentSegment[];
  textStart: number;
  topLevelDepth: number;
}

const flush = (state: SplitState, end: number) => {
  state.pendingHtml += state.html.slice(state.textStart, end);
  state.textStart = end;
  pushHtmlSegment(state.segments, state.pendingHtml);
  state.pendingImages.forEach(image => state.segments.push({ ...image, type: RichContentSegmentType.IMAGE }));
  state.pendingHtml = '';
  state.pendingImages = [];
};

const handlePaneTag = (state: SplitState, paneBlock: NonNullable<SplitState['paneBlock']>, tag: ParsedTag) => {
  if (tag.tagName === 'div' && !tag.isSelfClosing) paneBlock.depth += tag.isClosing ? -1 : 1;
  if (paneBlock.depth !== 0) return;
  const paneSegments = splitRichContent(state.html.slice(paneBlock.contentStart, tag.start), state.platformUrl);
  if (paneSegments.length) {
    state.segments.push({ paneType: paneBlock.type, segments: paneSegments, type: RichContentSegmentType.PANE });
  }
  state.textStart = tag.end;
  state.paneBlock = undefined;
};

const handleTableTag = (state: SplitState, tableBlock: NonNullable<SplitState['tableBlock']>, tag: ParsedTag) => {
  if (tag.tagName === 'table' && !tag.isSelfClosing) tableBlock.depth += tag.isClosing ? -1 : 1;
  if (tableBlock.depth !== 0) return;
  const segment = buildTableSegment(state.html.slice(tableBlock.contentStart, tag.start), cellHtml =>
    splitRichContent(cellHtml, state.platformUrl),
  );
  if (segment) state.segments.push(segment);
  state.textStart = tag.end;
  state.tableBlock = undefined;
};

const closeLatexBlockIfDone = (state: SplitState, latexBlock: NonNullable<SplitState['latexBlock']>, end: number) => {
  if (latexBlock.depth !== 0) return;
  state.segments.push({ latex: latexBlock.latex, type: RichContentSegmentType.LATEX });
  state.textStart = end;
  state.latexBlock = undefined;
};

// The formula is on the opening tag: the content of the block (if any) is skipped
const handleLatexTag = (state: SplitState, latexBlock: NonNullable<SplitState['latexBlock']>, tag: ParsedTag) => {
  if (tag.tagName === 'div' && !tag.isSelfClosing) latexBlock.depth += tag.isClosing ? -1 : 1;
  closeLatexBlockIfDone(state, latexBlock, tag.end);
};

const closeMediaBlockIfDone = (state: SplitState, mediaBlock: NonNullable<SplitState['mediaBlock']>, end: number) => {
  if (mediaBlock.depth !== 0) return;
  const segment = buildMediaSegment(mediaBlock.type, state.html.slice(mediaBlock.start, end), state.platformUrl);
  if (segment) state.segments.push(segment);
  state.textStart = end;
  state.mediaBlock = undefined;
};

const handleMediaTag = (state: SplitState, mediaBlock: NonNullable<SplitState['mediaBlock']>, tag: ParsedTag) => {
  if (tag.tagName === mediaBlock.tagName && !tag.isSelfClosing) mediaBlock.depth += tag.isClosing ? -1 : 1;
  closeMediaBlockIfDone(state, mediaBlock, tag.end);
};

const openPaneBlock = (state: SplitState, tag: ParsedTag, type: RichContentPaneType) => {
  flush(state, tag.start);
  state.topLevelDepth = 0;
  state.paneBlock = { contentStart: tag.end, depth: 1, start: tag.start, type };
};

const openTableBlock = (state: SplitState, tag: ParsedTag) => {
  flush(state, tag.start);
  state.topLevelDepth = 0;
  state.tableBlock = { contentStart: tag.end, depth: 1, start: tag.start };
};

const openLatexBlock = (state: SplitState, tag: ParsedTag, latex: string) => {
  flush(state, tag.start);
  state.topLevelDepth = 0;
  const latexBlock = { depth: tag.isSelfClosing ? 0 : 1, latex, start: tag.start };
  state.latexBlock = latexBlock;
  closeLatexBlockIfDone(state, latexBlock, tag.end);
};

const openMediaBlock = (state: SplitState, tag: ParsedTag, type: RichContentSegmentType) => {
  flush(state, tag.start);
  state.topLevelDepth = 0;
  // A self-closing media tag (ex: `<iframe ... />`) opens and closes its block at once
  const mediaBlock = { depth: tag.isSelfClosing ? 0 : 1, start: tag.start, tagName: tag.tagName, type };
  state.mediaBlock = mediaBlock;
  closeMediaBlockIfDone(state, mediaBlock, tag.end);
};

const handleImageTag = (state: SplitState, tag: ParsedTag) => {
  // Always remove the tag from the html: a valid image is rendered after its top-level block, others are dropped
  state.pendingHtml += state.html.slice(state.textStart, tag.start) + IMAGE_MARKER;
  state.textStart = tag.end;
  const image = getAuthenticatedImage(tag.rawAttributes, state.platformUrl);
  if (!image) return;
  state.pendingImages.push(image);
  if (state.topLevelDepth === 0) flush(state, tag.end);
};

const handleBlockTag = (state: SplitState, tag: ParsedTag) => {
  state.topLevelDepth = tag.isClosing ? Math.max(0, state.topLevelDepth - 1) : state.topLevelDepth + 1;
  if (state.topLevelDepth === 0 && state.pendingImages.length) flush(state, tag.end);
};

const handleContentTag = (state: SplitState, tag: ParsedTag) => {
  const attributes = tag.isClosing ? undefined : getAttributes(tag.rawAttributes);
  const paneType = attributes && !tag.isSelfClosing ? getPaneType(tag.tagName, attributes) : undefined;
  const mathLatex = attributes && !paneType ? getBlockLatex(tag.tagName, attributes) : undefined;
  const mediaBlockType = attributes && !paneType && !mathLatex ? getMediaBlockType(tag.tagName, attributes) : undefined;
  if (paneType) openPaneBlock(state, tag, paneType);
  else if (tag.tagName === 'table' && attributes && !tag.isSelfClosing) openTableBlock(state, tag);
  else if (mathLatex) openLatexBlock(state, tag, mathLatex);
  else if (mediaBlockType) openMediaBlock(state, tag, mediaBlockType);
  else if (tag.tagName === 'img') handleImageTag(state, tag);
  else if (!tag.isSelfClosing && !VOID_TAGS.has(tag.tagName)) handleBlockTag(state, tag);
};

const handleTag = (state: SplitState, tag: ParsedTag) => {
  if (state.paneBlock) handlePaneTag(state, state.paneBlock, tag);
  else if (state.tableBlock) handleTableTag(state, state.tableBlock, tag);
  else if (state.latexBlock) handleLatexTag(state, state.latexBlock, tag);
  else if (state.mediaBlock) handleMediaTag(state, state.mediaBlock, tag);
  else handleContentTag(state, tag);
};

/**
 * Images are moved right after the top-level block that contains them (`<p>`, `<div>`…),
 * so that the html given to `EnrichedText` stays balanced.
 * Pane's and table cells' content is split recursively.
 */
export const splitRichContent = (html: string, platformUrl?: string): RichContentSegment[] => {
  const state: SplitState = { html, pendingHtml: '', pendingImages: [], platformUrl, segments: [], textStart: 0, topLevelDepth: 0 };
  for (const match of html.matchAll(TAG_REGEX)) handleTag(state, toParsedTag(match));
  if (state.mediaBlock) state.textStart = state.mediaBlock.start;
  if (state.latexBlock) state.textStart = state.latexBlock.start;
  if (state.paneBlock) state.textStart = state.paneBlock.start;
  if (state.tableBlock) state.textStart = state.tableBlock.start;
  flush(state, html.length);
  return state.segments;
};
