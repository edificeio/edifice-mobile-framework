/**
 * Splits ENT rich content (html) into segments that can be rendered natively:
 * - text goes to `EnrichedText` (html segments),
 * - images, videos, audios, iframes and attachments become dedicated segments: `react-native-enriched-html` does not
 *   support most of them, and cannot authenticate image requests.
 *
 * A light regex tokenizer is used instead of a sax parser: ENT html is not strict xml (unclosed void tags),
 * and we only need to locate top-level media blocks, not build a tree.
 */
import { decode } from 'html-entities';

import { FileMedia, MediaType } from '~/framework/modules/media';
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

// Used to match a pressed media url with the medias built from the html
export const getComparableUrl = (url: string, platformUrl?: string): string => {
  try {
    const parsedUrl = new URL(getAbsoluteUrl(decode(url), platformUrl));
    return `${parsedUrl.origin}${parsedUrl.pathname}`;
  } catch {
    return url;
  }
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

const pushHtmlSegment = (segments: RichContentSegment[], rawHtml: string) => {
  // A `<p>` that only contained images would be rendered as an empty line by EnrichedText: remove it.
  // Other empty paragraphs are kept: they are the empty lines typed by the user.
  const html = rawHtml.replace(IMAGE_ONLY_PARAGRAPH_REGEX, '').replace(IMAGE_MARKER_REGEX, '');
  // Skip segments that only contain empty markup (ex: left between two media blocks)
  const hasText = html.replace(STRIP_TAGS_REGEX, '').replace(/&nbsp;|\s|\u200B/g, '').length > 0;
  if (hasText) segments.push({ html: convertHighlights(html), type: RichContentSegmentType.HTML });
};

// Images rendered outside of `EnrichedText`: its native loaders cannot authenticate requests (no header, no cookie)
const getAuthenticatedImage = (rawAttributes: string, platformUrl?: string): RichContentImage | undefined => {
  const attributes = getAttributes(rawAttributes);
  if (!attributes.src || attributes.src.startsWith('data:')) return undefined;
  return { declaredSize: parseSize(attributes.width, attributes.height), src: getAbsoluteUrl(decode(attributes.src), platformUrl) };
};

/**
 * Images are moved right after the top-level block that contains them (`<p>`, `<div>`…),
 * so that the html given to `EnrichedText` stays balanced.
 * Pane's content is split recursively.
 */
export const splitRichContent = (html: string, platformUrl?: string): RichContentSegment[] => {
  const segments: RichContentSegment[] = [];
  let pendingHtml = '';
  let pendingImages: RichContentImage[] = [];
  let textStart = 0;
  let topLevelDepth = 0;
  // Currently opened media block: its type, the tag that opened it and the nesting depth of that tag
  let mediaBlock: { depth: number; start: number; tagName: string; type: RichContentSegmentType } | undefined;
  // Currently opened information pane: `div` nesting depth, to find its closing tag
  let paneBlock: { contentStart: number; depth: number; start: number; type: RichContentPaneType } | undefined;

  const flush = (end: number) => {
    pendingHtml += html.slice(textStart, end);
    textStart = end;
    pushHtmlSegment(segments, pendingHtml);
    pendingImages.forEach(image => segments.push({ ...image, type: RichContentSegmentType.IMAGE }));
    pendingHtml = '';
    pendingImages = [];
  };

  for (const match of html.matchAll(TAG_REGEX)) {
    const [fullTag, closingSlash, rawTagName, rawAttributes] = match;
    const tagName = rawTagName.toLowerCase();
    const tagStart = match.index ?? 0;
    const tagEnd = tagStart + fullTag.length;
    const isSelfClosing = rawAttributes.trim().endsWith('/');

    if (paneBlock) {
      if (tagName === 'div' && !isSelfClosing) paneBlock.depth += closingSlash ? -1 : 1;
      if (paneBlock.depth === 0) {
        const paneSegments = splitRichContent(html.slice(paneBlock.contentStart, tagStart), platformUrl);
        if (paneSegments.length) {
          segments.push({ paneType: paneBlock.type, segments: paneSegments, type: RichContentSegmentType.PANE });
        }
        textStart = tagEnd;
        paneBlock = undefined;
      }
      continue;
    }

    const attributes = !mediaBlock && !closingSlash ? getAttributes(rawAttributes) : undefined;
    const paneType = attributes && !isSelfClosing ? getPaneType(tagName, attributes) : undefined;
    const mediaBlockType = attributes && !paneType ? getMediaBlockType(tagName, attributes) : undefined;

    if (paneType) {
      flush(tagStart);
      topLevelDepth = 0;
      paneBlock = { contentStart: tagEnd, depth: 1, start: tagStart, type: paneType };
      continue;
    }

    if (mediaBlock) {
      if (tagName === mediaBlock.tagName && !isSelfClosing) mediaBlock.depth += closingSlash ? -1 : 1;
    } else if (mediaBlockType) {
      flush(tagStart);
      topLevelDepth = 0;
      // A self-closing media tag (ex: `<iframe ... />`) opens and closes its block at once
      mediaBlock = { depth: isSelfClosing ? 0 : 1, start: tagStart, tagName, type: mediaBlockType };
    } else if (tagName === 'img') {
      // Always remove the tag from the html: a valid image is rendered after its top-level block, others are dropped
      pendingHtml += html.slice(textStart, tagStart) + IMAGE_MARKER;
      textStart = tagEnd;
      const image = getAuthenticatedImage(rawAttributes, platformUrl);
      if (image) {
        pendingImages.push(image);
        if (topLevelDepth === 0) flush(tagEnd);
      }
      continue;
    } else if (!isSelfClosing && !VOID_TAGS.has(tagName)) {
      topLevelDepth = closingSlash ? Math.max(0, topLevelDepth - 1) : topLevelDepth + 1;
      if (topLevelDepth === 0 && pendingImages.length) flush(tagEnd);
      continue;
    } else {
      continue;
    }

    if (mediaBlock?.depth === 0) {
      const segment = buildMediaSegment(mediaBlock.type, html.slice(mediaBlock.start, tagEnd), platformUrl);
      if (segment) segments.push(segment);
      textStart = tagEnd;
      mediaBlock = undefined;
    }
  }

  // An unclosed media block or pane is rendered as html: EnrichedText strips the tags it does not support
  if (mediaBlock) textStart = mediaBlock.start;
  if (paneBlock) textStart = paneBlock.start;
  flush(html.length);
  return segments;
};

const getAttachmentMediaType = (mime?: string): FileMedia['type'] => {
  if (mime?.startsWith('image/')) return MediaType.IMAGE;
  if (mime?.startsWith('video/')) return MediaType.VIDEO;
  if (mime?.startsWith('audio/')) return MediaType.AUDIO;
  return MediaType.ATTACHMENT;
};

// Medias opened in the multimedia carousel, in document order. Iframes are opened as links instead.
export const buildCarouselMedias = (segments: RichContentSegment[]): FileMedia[] =>
  segments.flatMap((segment): FileMedia[] => {
    switch (segment.type) {
      case RichContentSegmentType.IMAGE:
        return [{ mime: 'image/*', src: segment.src, type: MediaType.IMAGE }];
      case RichContentSegmentType.VIDEO:
        return [{ mime: 'video/*', poster: segment.posterUri, src: segment.src, type: MediaType.VIDEO } as FileMedia];
      case RichContentSegmentType.AUDIO:
        return [{ mime: 'audio/*', src: segment.src, type: MediaType.AUDIO }];
      case RichContentSegmentType.ATTACHMENTS:
        return segment.items.map(item => ({
          mime: item.mime ?? 'application/octet-stream',
          name: item.name,
          src: item.href,
          type: getAttachmentMediaType(item.mime),
        }));
      case RichContentSegmentType.PANE:
        return buildCarouselMedias(segment.segments);
      default:
        return [];
    }
  });

export const findMediaIndex = (medias: FileMedia[], url: string, platformUrl?: string): number => {
  const comparableUrl = getComparableUrl(url, platformUrl);
  const index = medias.findIndex(
    media => typeof media.src === 'string' && getComparableUrl(media.src, platformUrl) === comparableUrl,
  );
  return Math.max(index, 0);
};
