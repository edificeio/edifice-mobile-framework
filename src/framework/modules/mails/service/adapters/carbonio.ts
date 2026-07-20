import { AccountType } from '~/framework/modules/auth/model';
import {
  buildCarbonioAttachmentUrl,
  getCarbonioBaseUrl,
  getCarbonioTokenFromStore,
  normalizeCid,
} from '~/framework/modules/mails/service/carbonio-helpers';

import { MailsMailContentBackend, MailsMailPreviewBackend } from './mails';

/**
 * Normalize content from Carbonio part (content can be string or { _content: string })
 */
function partContent(part: any): string {
  if (!part) return '';
  const c = part.content;
  if (c?.truncated) console.warn(`Carbonio: message part ${part.part} content is truncated`);
  if (typeof c === 'string') return c;
  if (c && typeof c._content === 'string') return c._content;
  return '';
}

/**
 * Recursively find the HTML body part in a MIME tree.
 */
function findHtmlBodyInParts(parts: any[]): string {
  if (!parts || parts.length === 0) return '';
  // First pass: prefer text/html over any other body part (e.g. text/plain in multipart/alternative)
  for (const part of parts) {
    if (part.ct === 'text/html') {
      const content = partContent(part);
      if (content) return content;
    }
    if (part.mp && part.mp.length > 0) {
      const nested = findHtmlBodyInParts(part.mp);
      if (nested) return nested;
    }
  }
  // Fallback: accept any part with body=1 (text/plain when no HTML available)
  for (const part of parts) {
    if (part.body) {
      const content = partContent(part);
      if (content) return content;
    }
  }
  return '';
}

/**
 * Extract HTML body content from Carbonio message multipart structure.
 */
export function extractBodyFromCarbonioMessage(carbonioMessage: any): string {
  if (!carbonioMessage) return '';
  const mp = carbonioMessage.mp;
  if (!mp || mp.length === 0) return '';
  return findHtmlBodyInParts(mp) || '';
}

/**
 * Determine whether a MIME part is a file attachment (not body, not container).
 */
function isAttachmentPart(mp: any): boolean {
  const ct = mp.ct || '';
  if (ct.startsWith('multipart/')) return false;
  if (mp.body) return false;
  if (mp.cd === 'attachment') return true;
  // Some senders (Gmail, confirmed via a real repro) set a Content-ID even on genuine
  // attachments, not just on inline-embedded images — only treat `ci` as "inline, not an
  // attachment" once an explicit attachment Content-Disposition has been ruled out
  // (see INTEG-2130).
  if (mp.ci) return false;
  return !!(mp.filename && mp.filename.trim());
}

/**
 * Recursively collect all attachment parts from the MIME tree.
 */
export function collectAttachmentParts(mp: any[]): any[] {
  if (!mp) return [];
  const results: any[] = [];
  for (const part of mp) {
    if (isAttachmentPart(part)) {
      results.push(part);
    } else if (part.mp && part.mp.length > 0) {
      results.push(...collectAttachmentParts(part.mp));
    }
  }
  return results;
}

/**
 * Recursively collect all inline image parts from the MIME tree.
 * These are parts with a Content-ID (ci) field — i.e. images embedded in the body.
 */
export function collectInlineParts(mp: any[]): any[] {
  if (!mp) return [];
  const results: any[] = [];
  for (const part of mp) {
    if (part.ci && !part.ct?.startsWith('multipart/')) {
      results.push(part);
    } else if (part.mp && part.mp.length > 0) {
      results.push(...collectInlineParts(part.mp));
    }
  }
  return results;
}

/**
 * Extract attachments from Carbonio message multipart structure.
 */
export function extractAttachmentsFromCarbonioMessage(carbonioMessage: any): MailsMailContentBackend['attachments'] {
  const parts = collectAttachmentParts(carbonioMessage.mp || []);
  return parts.map((part: any) => ({
    charset: part.charset || 'utf-8',
    contentTransferEncoding: part.cte || 'base64',
    contentType: part.ct || 'application/octet-stream',
    filename: part.filename || part.part || '',
    id: part.part || part.id || '',
    name: part.filename || part.part || '',
    size: part.s || 0,
  }));
}

/**
 * Build a map from Content-ID values (without angle brackets) to MIME part numbers.
 * Used to resolve cid: image references to Carbonio REST download URLs.
 */
function buildCidToPartMap(mp: any[]): Record<string, string> {
  const map: Record<string, string> = {};
  if (!mp) return map;
  for (const part of mp) {
    if (part.ci && part.part) {
      const cid = normalizeCid(part.ci);
      if (cid) map[cid] = part.part;
    }
    if (part.mp && part.mp.length > 0) {
      Object.assign(map, buildCidToPartMap(part.mp));
    }
  }
  return map;
}

/** Extract content-id from img src="cid:...". HTML may encode @ as &#64;. */
function contentIdFromSrc(src: string): string {
  if (!src || !src.toLowerCase().startsWith('cid:')) return '';
  return normalizeCid(src.slice(4).trim()).replace(/&#64;/g, '@');
}

function addCarbonioAuth(src: string, token: string): string {
  const decoded = src.replace(/&amp;/g, '&');
  let cleanUrl = decoded.replace(/[?&]auth=[^&]*/g, '').replace(/[?&]zauthtoken=[^&]*/g, '');
  // When the removed param was first (right after ?), a dangling & is left in the path.
  // e.g. "https://host/path&foo=bar" → "https://host/path?foo=bar"
  cleanUrl = cleanUrl.replace(/^(https?:\/\/[^?&#]*)&/, '$1?');
  cleanUrl = cleanUrl.replace(/\?&/, '?').replace(/&&/g, '&').replace(/[?&]$/, '');
  const separator = cleanUrl.includes('?') ? '&' : '?';
  return `${cleanUrl}${separator}auth=qp&zauthtoken=${encodeURIComponent(token)}`;
}

/**
 * Replace img tags in the HTML body with authenticated Carbonio REST URLs so that
 * images render natively without requiring a webview redirect:
 *
 * - cid:XXXX            → Carbonio REST inline URL via CID→part map
 * - /service/home/ URLs → relative Carbonio REST URL returned by GetMsgRequest; made absolute + authed
 * - lyceeconnecte.fr    → absolute Carbonio URL; auth token refreshed
 * - data:               → kept as-is (already embedded)
 * - anything else       → kept as-is
 */
function replaceImagesWithAuthenticatedUrls(html: string, msgId: string, cidToPartMap: Record<string, string>): string {
  if (!html) return html;
  const token = getCarbonioTokenFromStore();
  return html.replace(/<img\s[^>]*>/gi, tag => {
    const srcMatch = tag.match(/\bsrc\s*=\s*["']([^"']*)["']/i);
    if (!srcMatch) return tag;
    const src = srcMatch[1].trim();

    if (!src || src.startsWith('data:')) return tag;

    if (src.toLowerCase().startsWith('cid:')) {
      const cid = contentIdFromSrc(src);
      const part = cidToPartMap[cid];
      if (part) {
        const authUrl = buildCarbonioAttachmentUrl(msgId, part, 'i', cid);
        return tag.replace(srcMatch[0], `src="${authUrl}"`);
      }
      return tag;
    }

    // Carbonio's GetMsgRequest returns relative /service/home/~/?id=X&part=Y URLs for inline images.
    // The mobile WebView cannot load these without an absolute URL and auth token.
    if (src.startsWith('/service/home/')) {
      if (token) {
        const authUrl = addCarbonioAuth(`${getCarbonioBaseUrl()}${src}`, token);
        return tag.replace(srcMatch[0], `src="${authUrl}"`);
      }
      return tag;
    }

    const carbonioBase = getCarbonioBaseUrl();
    if (carbonioBase && src.startsWith(carbonioBase)) {
      if (token) {
        const authUrl = addCarbonioAuth(src, token);
        return tag.replace(srcMatch[0], `src="${authUrl}"`);
      }
    }

    return tag;
  });
}

/**
 * Extract recipients from Carbonio email array (e field)
 */
function extractRecipients(carbonioRecipients: any[], type: 'f' | 't' | 'c' | 'b') {
  return (
    carbonioRecipients
      ?.filter((e: any) => e.t === type)
      .map((e: any) => ({
        children: [],
        displayName: e.p || e.d || '',
        id: e.a || '',
        profile: AccountType.External,
        relatives: [],
      })) || []
  );
}

/**
 * Find recipient by type (from, to, cc, bcc)
 */
function findRecipient(carbonioRecipients: any[], type: 'f' | 't' | 'c' | 'b') {
  const recipient = carbonioRecipients?.find((e: any) => e.t === type);
  return {
    children: [],
    displayName: recipient?.p || recipient?.d || '',
    id: recipient?.a || '',
    profile: AccountType.External,
    relatives: [],
  };
}

function subjectString(su: any): string {
  if (su == null) return '';
  if (typeof su === 'string') return su;
  return su._content ?? '';
}

/**
 * Adapt a single Carbonio message (GetMsgResponse or SearchResponse hit) to MailsMailContentBackend.
 */
export function carbonioMessageToMailContentBackend(message: any, messageId: string): MailsMailContentBackend {
  const recipients = message.e || [];
  const resolvedMsgId = message.id ?? messageId;
  const cidToPartMap = buildCidToPartMap(message.mp || []);
  let body = extractBodyFromCarbonioMessage(message);
  body = replaceImagesWithAuthenticatedUrls(body, resolvedMsgId, cidToPartMap);
  const attachments = extractAttachmentsFromCarbonioMessage(message);

  return {
    attachments,
    body,
    cc: { groups: [], users: extractRecipients(recipients, 'c') },
    cci: { groups: [], users: extractRecipients(recipients, 'b') },
    date: message.d ?? message.sd ?? Date.now(),
    folder_id: message.l ?? null,
    from: findRecipient(recipients, 'f'),
    id: resolvedMsgId,
    language: 'fr',
    noReply: false,
    original_format_exists: false,
    parent_id: message.cid ?? null,
    state: (message.f ?? '').includes('d') ? 'DRAFT' : 'SENT',
    subject: subjectString(message.su),
    thread_id: message.cid ?? resolvedMsgId,
    to: { groups: [], users: extractRecipients(recipients, 't') },
    trashed: message.l === '3',
    unread: (message.f ?? '').includes('u'),
  };
}

/**
 * Adapt a single Carbonio message (SearchResponse hit with types: message) to MailsMailPreviewBackend.
 */
export function carbonioMessageToMailPreviewBackend(carbonioMessage: any): MailsMailPreviewBackend {
  const recipients = carbonioMessage.e || [];
  return {
    cc: {
      groups: [],
      users: extractRecipients(recipients, 'c'),
    },
    cci: {
      groups: [],
      users: extractRecipients(recipients, 'b'),
    },
    count: 1,
    date: carbonioMessage.d ?? carbonioMessage.sd ?? Date.now(),
    from: findRecipient(recipients, 'f'),
    hasAttachment: carbonioMessage.f?.includes('a') ?? false,
    id: carbonioMessage.id,
    noReply: false,
    response: false,
    state: carbonioMessage.f?.includes('d') ? 'DRAFT' : 'SENT',
    subject: subjectString(carbonioMessage.su),
    to: {
      groups: [],
      users: extractRecipients(recipients, 't'),
    },
    unread: (carbonioMessage.f ?? '').includes('u'),
  };
}

const CONVERSATION_HISTORY_START = '<div class="conversation-history">';
const SEPARATOR_BEFORE_HISTORY = '\n<hr id="zwchr">\n';

/**
 * Normalize HTML body before sending/saving draft:
 * insert <hr id="zwchr"> before conversation-history block so Carbonio threads correctly.
 */
export function normalizeFromMobileToWeb(html: string): string {
  if (!html) return html;
  const historyIndex = html.indexOf(CONVERSATION_HISTORY_START);
  if (historyIndex !== -1) {
    return html.slice(0, historyIndex).trimEnd() + SEPARATOR_BEFORE_HISTORY + html.slice(historyIndex);
  }
  return html;
}

/**
 * In the HTML body, replace Carbonio part download URLs for inline images with cid: references.
 * This converts the preview URL embedded in the compose WebView back to the standard email
 * format that is stored in the draft/sent message so recipients receive valid CID references.
 */
export function replaceInlineUrlsWithCids(html: string, inlineParts: any[]): string {
  if (!html || !inlineParts.length) return html;
  // Pre-compile regexes and build replacement map before iterating the HTML string
  const replacements = inlineParts
    .filter(part => part.ci && part.part)
    .map(part => {
      const cid = normalizeCid(part.ci);
      return {
        cid,

        // Match by cid= URL parameter: images from original message in forward/reply (encoded by buildCarbonioAttachmentUrl)
        cidRegex: new RegExp(
          `src=["'][^"']*(?:[?&]|&amp;)cid=${encodeURIComponent(cid).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"']*["']`,
          'gi',
        ),

        // Match by part number: inline images added by user during composition
        partRegex: new RegExp(
          `src=["'][^"']*(?:[?&]|&amp;)part=${part.part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"']*["']`,
          'gi',
        ),
      };
    });
  let result = html;
  for (const { cid, cidRegex, partRegex } of replacements) {
    result = result.replace(partRegex, `src="cid:${cid}"`);
    result = result.replace(cidRegex, `src="cid:${cid}"`);
  }
  return result;
}
