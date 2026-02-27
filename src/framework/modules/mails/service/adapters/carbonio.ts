import { MailsMailContentBackend, MailsMailPreviewBackend } from './mails';

import { I18n } from '~/app/i18n';
import { AccountType } from '~/framework/modules/auth/model';

/**
 * Normalize content from Carbonio part (content can be string or { _content: string })
 */
function partContent(part: any): string {
  if (!part) return '';
  const c = part.content;
  if (typeof c === 'string') return c;
  if (c && typeof c._content === 'string') return c._content;
  return '';
}

/**
 * Recursively find the HTML body part in a MIME tree (handles multipart/mixed -> multipart/alternative -> text/html when there are attachments).
 */
function findHtmlBodyInParts(parts: any[]): string {
  if (!parts || parts.length === 0) return '';
  for (const part of parts) {
    if (part.body || part.ct === 'text/html') {
      const content = partContent(part);
      if (content) return content;
    }
    if (part.mp && part.mp.length > 0) {
      const nested = findHtmlBodyInParts(part.mp);
      if (nested) return nested;
    }
  }
  return '';
}

/**
 * Extract HTML body content from Carbonio message multipart structure.
 * Handles flat mp[], one level of nesting (mp[0].mp[]), and deep nesting (e.g. multipart/mixed -> multipart/alternative -> text/html when there are attachments).
 */
function extractBodyFromCarbonioMessage(carbonioMessage: any): string {
  const mp = carbonioMessage.mp;
  if (!mp || mp.length === 0) return '';
  return findHtmlBodyInParts(mp) || '';
}

/**
 * Extract attachments from Carbonio message multipart structure
 */
function extractAttachmentsFromCarbonioMessage(carbonioMessage: any): MailsMailContentBackend['attachments'] {
  return (
    carbonioMessage.mp
      ?.flatMap((mp: any) => {
        if (mp.mp) {
          return mp.mp.filter((part: any) => {
            const ct = part.ct || '';
            return ct && !ct.startsWith('text/') && !ct.startsWith('multipart/');
          });
        }
        const ct = mp.ct || '';
        if (ct && !ct.startsWith('text/') && !ct.startsWith('multipart/')) {
          return [mp];
        }
        return [];
      })
      .map((mp: any) => ({
        charset: mp.charset || 'utf-8',
        contentTransferEncoding: mp.ci || 'base64',
        contentType: mp.ct || 'application/octet-stream',
        filename: mp.filename || mp.part || '',
        id: mp.part || mp.id || '',
        name: mp.filename || mp.part || '',
        size: mp.s || 0,
      })) || []
  );
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

function isImageToReplace(src: string): boolean {
  if (!src || typeof src !== 'string' || src.trim() === '') return true;
  const s = src.trim();
  if (s.startsWith('cid:') || s.startsWith('data:')) return true;
  return s.startsWith('https://mon.lyceeconnecte.fr') || s.startsWith('https://mail.lyceeconnecte.fr');
}

/**
 * Replaces each <img> in html whose src is invalid (not a URL or lyceeconnecte host)
 * with a link to the web version of the mail.
 */
function replaceInvalidImagesWithWebViewLink(html: string, webViewUrl: string): string {
  if (!html || !webViewUrl) return html;
  const safeUrl = webViewUrl.replace(/"/g, '&quot;');
  const linkHtml = `<p style="margin:0; font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
  <a href="${safeUrl}" target="_blank" rel="noopener noreferrer"
     style="display:inline-flex; align-items:center; gap:10px; padding:4px 8px;
            border:1px dashed #d1d5db; border-radius:12px; text-decoration:none; color:#111827;
            background:#fafafa;">
    <span aria-hidden="true">🖼️</span>
    <span style="font-size:12px;font-style:italic;">
    ${I18n.get('mails-details-editorRiche-openImageInWeb')}
    </span>
  </a>
</p>`;
  return html.replace(/<img\s[^>]*>/gi, tag => {
    const srcMatch = tag.match(/src\s*=\s*["']([^"']*)["']/i);
    const src = srcMatch ? srcMatch[1].trim() : '';
    if (isImageToReplace(src)) return linkHtml;
    return tag;
  });
}

/**
 * Adapt a single Carbonio message (GetMsgResponse or SearchResponse hit) to MailsMailContentBackend.
 * No conversation history: only the message body.
 */
export function carbonioMessageToMailContentBackend(message: any, messageId: string): MailsMailContentBackend {
  const recipients = message.e || [];
  let body = extractBodyFromCarbonioMessage(message);
  const folderId = message.l ?? '';
  const webViewUrl = `/auth/carbonio/preauth?callback=${encodeURIComponent(
    `https://mail.lyceeconnecte.fr/carbonio/focus-mode/mail-view/folder/${folderId}/message/${message.id ?? messageId}`,
  )}`;
  body = replaceInvalidImagesWithWebViewLink(body, webViewUrl);
  const attachments = extractAttachmentsFromCarbonioMessage(message);

  return {
    attachments,
    body,
    cc: { groups: [], users: extractRecipients(recipients, 'c') },
    cci: { groups: [], users: extractRecipients(recipients, 'b') },
    date: message.d ?? message.sd ?? Date.now(),
    folder_id: message.l ?? null,
    from: findRecipient(recipients, 'f'),
    id: message.id ?? messageId,
    language: 'fr',
    noReply: false,
    original_format_exists: false,
    parent_id: message.cid ?? null,
    state: (message.f ?? '').includes('d') ? 'DRAFT' : 'SENT',
    subject: subjectString(message.su),
    thread_id: message.cid ?? message.id ?? messageId,
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

/**
 * Removes the div with class "conversation-histor" (or "conversation-history") from HTML body
 * so that conversation history is not sent with the email.
 */
export function removeConversationHistoryFromBody(html: string): string {
  const classRegex = /<div\s[^>]*class=["'][^"']*conversation-histor[^"']*["'][^>]*>/i;
  const match = html.match(classRegex);
  if (!match) return html;
  const openTag = match[0];
  const startIndex = html.indexOf(openTag);
  const afterOpen = startIndex + openTag.length;
  let depth = 1;
  let pos = afterOpen;
  while (depth > 0 && pos < html.length) {
    const nextOpen = html.indexOf('<div', pos);
    const nextClose = html.indexOf('</div>', pos);
    if (nextClose === -1) break;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + 4;
    } else {
      depth--;
      pos = nextClose + 6;
      if (depth === 0) {
        return html.slice(0, startIndex).trimEnd() + html.slice(pos);
      }
    }
  }
  return html;
}
