/**
 * Splits ENT rich content (html) into segments that can be rendered natively:
 * - text goes to `EnrichedText` (html segments),
 * - images, videos, audios, iframes and attachments become dedicated segments: `react-native-enriched-html` does not
 *   support most of them, and cannot authenticate image requests.
 *
 * A light regex tokenizer is used instead of a sax parser: ENT html is not strict xml (unclosed void tags),
 * and we only need to locate top-level media blocks, not build a tree.
 */
import { Platform } from 'react-native';

import { decode } from 'html-entities';

import { computeVideoThumbnail } from '~/framework/modules/workspace/service';
import { extractVideoResolution } from '~/framework/util/htmlParser/content';
import { parseAttrs } from '~/utils/attrs';

import {
  ImageSize,
  RichContentAttachment,
  RichContentImage,
  RichContentPaneType,
  RichContentSegment,
  RichContentSegmentType,
} from './types';

const TAG_REGEX = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const LINK_TAG_REGEX = /<a\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/a>/gi;
const STRIP_TAGS_REGEX = /<[^>]*>/g;
const MARK_OPENING_TAG_REGEX = /<mark\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
const MARK_CLOSING_TAG_REGEX = /<\/mark\s*>/gi;
const BACKGROUND_COLOR_REGEX = /background-color\s*:\s*([^;]+)/i;
// Left in place of an extracted `<img>`, to tell paragraphs emptied by the extraction from real empty lines
const IMAGE_MARKER = '<!--rich-img-->';
const IMAGE_MARKER_REGEX = new RegExp(IMAGE_MARKER, 'g');
const IMAGE_ONLY_PARAGRAPH_REGEX = new RegExp(`<p\\b[^>]*>\\s*(?:${IMAGE_MARKER}\\s*)+</p>`, 'gi');
const VOID_TAGS = new Set(['area', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

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

const getAttributes = (rawAttributes: string): Record<string, string> => {
  try {
    return parseAttrs(rawAttributes.replace(/\/\s*$/, '').trim()) as Record<string, string>;
  } catch {
    // Malformed attributes: ignore them rather than failing the whole render
    return {};
  }
};

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
  const parsedWidth = width ? parseFloat(width) : NaN;
  const parsedHeight = height ? parseFloat(height) : NaN;
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
 * Tiptap highlights are `<mark>` tags, unknown to `EnrichedText` (the tag is dropped, the color lost).
 * They are converted to `<span style="background-color: …">`, which `EnrichedText` renders as a custom style.
 */
const convertHighlights = (html: string): string =>
  html
    .replace(MARK_OPENING_TAG_REGEX, (_, rawAttributes: string) => {
      const attributes = getAttributes(rawAttributes);
      const color = attributes.style?.match(BACKGROUND_COLOR_REGEX)?.[1].trim() ?? attributes['data-color'];
      return color ? `<span style="background-color: ${color}">` : '<span>';
    })
    .replace(MARK_CLOSING_TAG_REGEX, '</span>');

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

const pushHtmlSegment = (segments: RichContentSegment[], rawHtml: string) => {
  // A `<p>` that only contained images would be rendered as an empty line by EnrichedText: remove it.
  // Other empty paragraphs are kept: they are the empty lines typed by the user.
  const html = rawHtml.replace(IMAGE_ONLY_PARAGRAPH_REGEX, '').replace(IMAGE_MARKER_REGEX, '');
  // Skip segments that only contain empty markup (ex: left between two media blocks)
  const hasText = html.replace(STRIP_TAGS_REGEX, '').replace(/&nbsp;|\s|\u200B/g, '').length > 0;
  if (hasText) segments.push({ html: toParsableHtml(convertHighlights(html)), type: RichContentSegmentType.HTML });
};

// Images rendered outside of `EnrichedText`: its native loaders cannot authenticate requests (no header, no cookie)
const getAuthenticatedImage = (rawAttributes: string, platformUrl?: string): RichContentImage | undefined => {
  const attributes = getAttributes(rawAttributes);
  if (!attributes.src || attributes.src.startsWith('data:')) return undefined;
  return { declaredSize: parseSize(attributes.width, attributes.height), src: getAbsoluteUrl(decode(attributes.src), platformUrl) };
};

interface ParsedTag {
  end: number;
  isClosing: boolean;
  isSelfClosing: boolean;
  rawAttributes: string;
  start: number;
  tagName: string;
}

interface SplitState {
  html: string;
  // Currently opened media block: its type, the tag that opened it and the nesting depth of that tag
  mediaBlock?: { depth: number; start: number; tagName: string; type: RichContentSegmentType };
  // Currently opened information pane: `div` nesting depth, to find its closing tag
  paneBlock?: { contentStart: number; depth: number; start: number; type: RichContentPaneType };
  pendingHtml: string;
  pendingImages: RichContentImage[];
  platformUrl?: string;
  segments: RichContentSegment[];
  textStart: number;
  topLevelDepth: number;
}

const toParsedTag = (match: RegExpExecArray): ParsedTag => {
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
  // A pane's content is split recursively
  const paneSegments = splitRichContent(state.html.slice(paneBlock.contentStart, tag.start), state.platformUrl);
  if (paneSegments.length) {
    state.segments.push({ paneType: paneBlock.type, segments: paneSegments, type: RichContentSegmentType.PANE });
  }
  state.textStart = tag.end;
  state.paneBlock = undefined;
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

const openPane = (state: SplitState, tag: ParsedTag, type: RichContentPaneType) => {
  flush(state, tag.start);
  state.topLevelDepth = 0;
  state.paneBlock = { contentStart: tag.end, depth: 1, start: tag.start, type };
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

// Tag outside of any pane or media block: may open one, or be an image or a block that contains images
const handleContentTag = (state: SplitState, tag: ParsedTag) => {
  const attributes = tag.isClosing ? undefined : getAttributes(tag.rawAttributes);
  const paneType = attributes && !tag.isSelfClosing ? getPaneType(tag.tagName, attributes) : undefined;
  const mediaBlockType = attributes && !paneType ? getMediaBlockType(tag.tagName, attributes) : undefined;
  if (paneType) openPane(state, tag, paneType);
  else if (mediaBlockType) openMediaBlock(state, tag, mediaBlockType);
  else if (tag.tagName === 'img') handleImageTag(state, tag);
  else if (!tag.isSelfClosing && !VOID_TAGS.has(tag.tagName)) handleBlockTag(state, tag);
};

const handleTag = (state: SplitState, tag: ParsedTag) => {
  if (state.paneBlock) handlePaneTag(state, state.paneBlock, tag);
  else if (state.mediaBlock) handleMediaTag(state, state.mediaBlock, tag);
  else handleContentTag(state, tag);
};

/**
 * Images are moved right after the top-level block that contains them (`<p>`, `<div>`…),
 * so that the html given to `EnrichedText` stays balanced.
 * Pane's content is split recursively.
 */
export const splitRichContent = (html: string, platformUrl?: string): RichContentSegment[] => {
  const state: SplitState = { html, pendingHtml: '', pendingImages: [], platformUrl, segments: [], textStart: 0, topLevelDepth: 0 };
  for (const match of html.matchAll(TAG_REGEX)) handleTag(state, toParsedTag(match));
  // An unclosed media block or pane is rendered as html: EnrichedText strips the tags it does not support
  if (state.mediaBlock) state.textStart = state.mediaBlock.start;
  if (state.paneBlock) state.textStart = state.paneBlock.start;
  flush(state, html.length);
  return state.segments;
};

const MEDIA_CONTENT_REGEX = /<(?:audio|iframe|img|video)\b|class\s*=\s*["'][^"']*\b(?:attachments|download-attachments)\b/i;
export const hasMediaContent = (html: string): boolean => MEDIA_CONTENT_REGEX.test(html);
