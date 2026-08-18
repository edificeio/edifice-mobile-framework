import { getStore } from '~/app/store';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { actions as authActions } from '~/framework/modules/auth/redux/actions';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import { IMailsFolder, IMailsMailAttachment, MailsConversationPayload } from '~/framework/modules/mails/model';
import {
  mailContentAdapter,
  mailsAdapter,
  MailsVisibleBackend,
  mailVisibleAdapter,
} from '~/framework/modules/mails/service/adapters/mails';
import {
  buildCarbonioAttachmentUrl,
  getCarbonioBaseUrl,
  getCarbonioEmailDomain,
  getCarbonioSoapBaseUrl,
  normalizeCid,
  uploadFileToCarbonio,
} from '~/framework/modules/mails/service/carbonio-helpers';
import { IDistantFileWithId } from '~/framework/util/fileHandler';
import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler/models';
import { sessionFetch } from '~/framework/util/transport';

import {
  carbonioMessageToMailContentBackend,
  carbonioMessageToMailPreviewBackend,
  collectAttachmentParts,
  collectInlineParts,
  extractAttachmentsFromCarbonioMessage,
  extractBodyFromCarbonioMessage,
  normalizeFromMobileToWeb,
  replaceInlineUrlsWithCids,
} from '../adapters/carbonio';

/**
 * Get Carbonio authToken from token endpoint
 */
export async function getCarbonioAuthToken(_: AuthActiveAccount): Promise<string> {
  const session = getSession();
  if (!session) throw new Error('No session found');

  const responseText = await sessionFetch.text('/auth/carbonio/token', { method: 'GET' });
  const token = responseText.trim();
  getStore().dispatch(authActions.setCarbonioToken(session.user.id, token));
  try {
    const carbonioUserInfos = await getCarbonioUserInfos(token);
    getStore().dispatch(authActions.setCarbonioUserInfos(session.user.id, carbonioUserInfos));
  } catch (error) {
    console.error('Failed to get Carbonio user infos', error);
  }

  return token;
}

const getCarbonioUserInfos = async (tokenCarbonio: string) => {
  const response = await sessionFetch(`${getCarbonioSoapBaseUrl()}/GetInfoRequest`, {
    body: JSON.stringify({
      Body: {
        GetInfoRequest: {
          _jsns: 'urn:zimbraAccount',
          rights: 'sendAs,sendAsDistList,viewFreeBusy,sendOnBehalfOf,sendOnBehalfOfDistList',
        },
      },
      Header: {
        context: {
          _jsns: 'urn:zimbra',
          authToken: {
            _content: tokenCarbonio,
          },
        },
      },
    }),
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `ZM_AUTH_TOKEN=${tokenCarbonio}`,
    },
    method: 'POST',
  });
  if (!response.ok) throw new Error(`Carbonio GetInfo failed: ${response.status}`);
  const data = await response.json();
  return data.Body?.GetInfoResponse ?? data;
};
/**
 * Build SOAP request body for Carbonio API
 */
function buildSoapRequest(authToken: string, requestName: string, body: any, contentName: string): any {
  return {
    Body: {
      [requestName]: {
        ...body,
        _jsns: 'urn:zimbraMail',
      },
    },
    Header: {
      context: {
        _jsns: 'urn:zimbra',
        ...(contentName &&
          contentName !== '' && {
            account: {
              _content: contentName,
              by: 'name',
            },
          }),
        authToken: {
          _content: authToken,
        },
      },
    },
  };
}

/**
 * Build an Error from a Carbonio SOAP Fault, preserving its error code (e.g. mail.ALREADY_EXISTS)
 * as an own `code` property so callers can distinguish fault types (see INTEG-2126).
 */
function buildCarbonioFaultError(fault: any): Error {
  const errorCode: string = fault?.Detail?.Error?.Code ?? '';
  const faultText = typeof fault?.Reason?.Text === 'string' ? fault.Reason.Text : (fault?.Reason?.Text?._content ?? '');
  const detail = faultText || errorCode || JSON.stringify(fault);
  const error = new Error(`Carbonio fault: ${detail}`);
  Object.assign(error, { code: errorCode });
  return error;
}

/**
 * Make SOAP request to Carbonio API
 */
async function carbonioSoapRequest<T>(
  session: AuthActiveAccount,
  requestName: string,
  requestBody: any,
  withContentName: boolean = false,
): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++) {
    let authToken = getStore().getState().auth.accounts[session.user.id]?.tokens?.carbonioToken;
    if (!authToken) {
      authToken = await getCarbonioAuthToken(session);
      if (!authToken) throw new Error('Carbonio auth token not found');
    }

    const contentName = withContentName
      ? (getStore().getState().auth.accounts[session.user.id]?.carbonioUserInfos?.name ?? `${session.user.login}@${getCarbonioEmailDomain()}`)
      : '';
    const soapBody = buildSoapRequest(authToken, requestName, requestBody, contentName);

    // sessionFetch (via _baseFetch) already throws an HTTPError for any non-2xx response before
    // returning here, so `response` below is always `ok` — non-2xx SOAP faults are handled by
    // the caller inspecting the thrown HTTPError's JSON body instead (see INTEG-2126).
    const response = await sessionFetch(`${getCarbonioSoapBaseUrl()}/${requestName}`, {
      body: JSON.stringify(soapBody),
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `ZM_AUTH_TOKEN=${authToken}`,
      },
      method: 'POST',
    });

    const data = await response.json();
    if (data.Body?.Fault) {
      const fault = data.Body.Fault;
      const errorCode: string = fault.Detail?.Error?.Code ?? '';
      if (attempt === 0 && (errorCode === 'account.AUTH_EXPIRED' || errorCode === 'account.AUTH_TOKEN_EXPIRED')) {
        await getCarbonioAuthToken(session);
        continue;
      }
      throw buildCarbonioFaultError(fault);
    }
    const responseKey = `${requestName.replace(/Request$/, '')}Response`;
    return data.Body?.[responseKey] ?? data;
  }
  throw new Error('Carbonio: max retry attempts reached');
}

const folderIdSwitch = (folderId: string) => {
  switch (folderId) {
    case 'inbox':
      return 'inId:"2"';
    case 'outbox':
      return 'inId:"5"';
    case 'draft':
      return 'inId:"6"';
    case 'trash':
      return 'inId:"3"';
    default:
      return `inId:"${folderId}"`;
  }
};

export const defaultUserIdCarbonio = (session: AuthActiveAccount | undefined) => {
  if (!session) return '';
  return getStore().getState().auth.accounts[session.user.id]?.carbonioUserInfos?.name ?? `${session.user.login}@${getCarbonioEmailDomain()}`;
};
const getItemId = (id: string) => id.startsWith('-') ? id.slice(1) : id;

// Carbonio has no native way to add/remove one attachment: every mutation rereads the whole
// draft MIME tree and rewrites it via SaveDraftRequest, which fully replaces the message.
// Serialize these read-modify-write cycles per draft so concurrent add/remove calls (e.g.
// importing several files at once, up to 6 in parallel) don't race and stomp on each other's
// SaveDraftRequest, which otherwise causes attachments to collide on the same part id or to
// vanish entirely (see INTEG-2133).
const draftMutationQueues = new Map<string, Promise<unknown>>();
function withDraftLock<T>(draftId: string, task: () => Promise<T>): Promise<T> {
  const previous = draftMutationQueues.get(draftId) ?? Promise.resolve();
  const run = previous.then(task, task);
  draftMutationQueues.set(draftId, run.catch(() => undefined));
  return run;
}

export const carbonioMailsApi = {
  attachments: {
    add: async (params: { draftId: string }, file: LocalFile) => {
      const session = getSession();
      if (!session) throw new Error('No session found');
      const safeId = getItemId(params.draftId);

      const aid = await uploadFileToCarbonio(file);

      return withDraftLock(safeId, async () => {
        // Read the full current state so we can reconstruct the MIME tree explicitly.
        // Without this, Carbonio wraps an existing multipart/related (body + inline
        // images) inside a new multipart/mixed when adding the PJ, silently renumbering all
        // part IDs and breaking the inline image URLs stored in the HTML body.
        const currentMsg = await carbonioSoapRequest<any>(session, 'GetMsgRequest', {
          m: { html: 1, id: safeId, needExp: 1 },
        });
        const message = currentMsg?.m?.[0];
        const currentMp = message?.mp || [];
        const body = extractBodyFromCarbonioMessage(message);
        const inlineParts = collectInlineParts(currentMp);
        const regularParts = collectAttachmentParts(currentMp);
        const bodyWithCids = replaceInlineUrlsWithCids(body, inlineParts);

        // Rebuild the MIME structure explicitly (same pattern as remove/uploadInlineImage) so
        // Carbonio does not change existing part numbers when inserting the new attachment.
        const m: any = { id: safeId };
        if (inlineParts.length > 0) {
          m.mp = [{
            ct: 'multipart/related',
            mp: [
              { content: { _content: bodyWithCids }, ct: 'text/html' },
              ...inlineParts.map((p: any) => ({
                attach: { mp: [{ mid: safeId, part: p.part }] },
                cd: 'inline',
                ci: normalizeCid(p.ci),
                ct: p.ct,
              })),
            ],
          }];
        } else {
          m.mp = [{ content: { _content: body }, ct: 'text/html' }];
        }
        m.attach = {
          ...(regularParts.length ? { mp: regularParts.map((p: any) => ({ mid: safeId, part: p.part })) } : {}),
          aid,
        };

        await carbonioSoapRequest<any>(session, 'SaveDraftRequest', { m });

        const afterMsg = await carbonioSoapRequest<any>(session, 'GetMsgRequest', {
          m: { html: 1, id: safeId, needExp: 1 },
        });
        const afterMp = afterMsg?.m?.[0]?.mp || [];
        const afterParts = collectAttachmentParts(afterMp);
        const beforeFilenameCount = regularParts.filter((p: any) => p.filename === file.filename).length;
        const afterFilenameMatches = afterParts.filter((p: any) => p.filename === file.filename);
        const newPart = afterFilenameMatches[beforeFilenameCount] ?? afterFilenameMatches[afterFilenameMatches.length - 1];
        if (!newPart) throw new Error('Carbonio: could not find uploaded attachment part');

        // Build a mapping from old inline-image part numbers to new ones so the editor
        // can update its absolute URLs (which embed the part number) after the MIME
        // restructuring caused by adding the attachment.
        const afterInlineParts = collectInlineParts(afterMp);
        const inlinePartMapping: Record<string, string> = {};
        for (const oldInlinePart of inlineParts) {
          const ci = normalizeCid(oldInlinePart.ci);
          const newInlinePart = afterInlineParts.find(
            (p: any) => normalizeCid(p.ci) === ci,
          );
          if (newInlinePart && oldInlinePart.part !== newInlinePart.part) {
            inlinePartMapping[oldInlinePart.part] = newInlinePart.part;
          }
        }

        return {
          attachment: new SyncedFileWithId(
            new LocalFile(
              { filename: file.filename, filepath: file.filepath, filetype: file.filetype },
              { _needIOSReleaseSecureAccess: false },
            ),
            { id: newPart.part, url: buildCarbonioAttachmentUrl(params.draftId, newPart.part, 'a') },
          ),
          // Authoritative post-mutation attachment list: carried-over attachments may have been
          // renumbered by Carbonio when rebuilding the MIME tree above (their {mid, part} reference
          // is a copy-by-source, not a guarantee the target part number is preserved). The client
          // should replace its local attachment state from this list rather than trust previously
          // resolved ids (see INTEG-2133).
          attachments: extractAttachmentsFromCarbonioMessage({ mp: afterMp }),
          inlinePartMapping,
        };
      });
    },
    allowMultimediaUpload: true,
    getDistantFile: (attachment: IMailsMailAttachment, mailId: string): IDistantFileWithId => ({
      filename: attachment.filename,
      filesize: attachment.size,
      filetype: attachment.contentType,
      id: attachment.id,
      url: buildCarbonioAttachmentUrl(mailId, attachment.id, 'a'),
    }),
    remove: async (params: { attachmentId: string; draftId: string }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');
      const safeId = getItemId(params.draftId);

      return withDraftLock(safeId, async () => {
        const currentMsg = await carbonioSoapRequest<any>(session, 'GetMsgRequest', {
          m: { html: 1, id: safeId, needExp: 1 },
        });
        const message = currentMsg?.m?.[0];
        const currentMp = message?.mp || [];
        const body = extractBodyFromCarbonioMessage(message);
        const inlineParts = collectInlineParts(currentMp);
        const remainingParts = collectAttachmentParts(currentMp).filter(
          (p: any) => p.part !== params.attachmentId,
        );
        const bodyWithCids = replaceInlineUrlsWithCids(body, inlineParts);

        const m: any = { id: safeId };
        if (inlineParts.length > 0) {
          m.mp = [{
            ct: 'multipart/related',
            mp: [
              { content: { _content: bodyWithCids }, ct: 'text/html' },
              ...inlineParts.map((p: any) => ({
                attach: { mp: [{ mid: safeId, part: p.part }] },
                cd: 'inline',
                ci: normalizeCid(p.ci),
                ct: p.ct,
              })),
            ],
          }];
        } else {
          m.mp = [{ content: { _content: body }, ct: 'text/html' }];
        }
        if (remainingParts.length) {
          m.attach = { mp: remainingParts.map((p: any) => ({ mid: safeId, part: p.part })) };
        }

        await carbonioSoapRequest<any>(session, 'SaveDraftRequest', { m });

        // Re-fetch: the remaining attachments carried over above may have been renumbered by
        // Carbonio when rebuilding the MIME tree, so their old part ids can no longer be trusted
        // (see INTEG-2133). Return the authoritative post-removal list for the client to resync.
        const afterMsg = await carbonioSoapRequest<any>(session, 'GetMsgRequest', {
          m: { html: 1, id: safeId, needExp: 1 },
        });
        const afterMp = afterMsg?.m?.[0]?.mp || [];
        return { attachments: extractAttachmentsFromCarbonioMessage({ mp: afterMp }) };
      });
    },
    supportViewAttachments: true,
    uploadInlineImage: async (params: { draftId: string }, file: LocalFile): Promise<string> => {
      const session = getSession();
      if (!session) throw new Error('No session found');
      const safeId = getItemId(params.draftId);

      const aid = await uploadFileToCarbonio(file);
      const cid = `img-${Date.now()}-${Math.random().toString(36).slice(2)}@carbonio`;

      return withDraftLock(safeId, async () => {
        const currentMsg = await carbonioSoapRequest<any>(session, 'GetMsgRequest', {
          m: { html: 1, id: safeId, needExp: 1 },
        });
        const message = currentMsg?.m?.[0];
        const currentMp = message?.mp || [];
        const currentBody = extractBodyFromCarbonioMessage(message);
        const currentRegularParts = collectAttachmentParts(currentMp);
        const currentInlineParts = collectInlineParts(currentMp);
        const bodyWithCids = replaceInlineUrlsWithCids(currentBody, currentInlineParts);

        const m: any = {
          id: safeId,
          mp: [{
            ct: 'multipart/related',
            mp: [
              { content: { _content: bodyWithCids }, ct: 'text/html' },
              ...currentInlineParts.map((p: any) => ({
                attach: { mp: [{ mid: safeId, part: p.part }] },
                cd: 'inline',
                ci: normalizeCid(p.ci),
                ct: p.ct,
              })),
              { attach: { aid }, cd: 'inline', ci: cid, ct: file.filetype || 'image/jpeg' },
            ],
          }],
        };
        if (currentRegularParts.length) {
          m.attach = { mp: currentRegularParts.map((p: any) => ({ mid: safeId, part: p.part })) };
        }

        await carbonioSoapRequest<any>(session, 'SaveDraftRequest', { m });

        const updatedMsg = await carbonioSoapRequest<any>(session, 'GetMsgRequest', {
          m: { html: 1, id: safeId, needExp: 1 },
        });
        const updatedMp = updatedMsg?.m?.[0]?.mp || [];
        const newInlinePart = collectInlineParts(updatedMp).find(
          (p: any) => p.ci && normalizeCid(p.ci) === cid,
        );
        if (!newInlinePart) throw new Error('Carbonio: could not find uploaded inline image part');

        return buildCarbonioAttachmentUrl(params.draftId, newInlinePart.part, 'i');
      });
    },
  },
  bookmark: {
    getById: null,
  },
  folder: {
    count: async (params: { folderId: string; unread: boolean }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');
      const idMap: Record<string, string> = { draft: '6', inbox: '2', outbox: '5', trash: '3' };
      const numericId = idMap[params.folderId];
      if (!numericId) return { count: 0 };
      const response = await carbonioSoapRequest<any>(session, 'GetFolderRequest', { folder: { l: numericId } });
      const folder = response?.folder?.[0];
      return { count: params.unread ? (folder?.u ?? 0) : (folder?.n ?? 0) };
    },
    create: async (payload: { name: string; parentId?: string }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');
      const response = await carbonioSoapRequest<any>(session, 'CreateFolderRequest', {
        folder: { l: payload.parentId || '1', name: payload.name, view: 'message' },
      });
      const id = response?.folder?.[0]?.id;
      if (!id) throw new Error('Carbonio: folder creation failed');
      return id as string;
    },
    delete: async (params: { id: string }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');

      // Carbonio's FolderActionRequest op:"delete" hard-deletes the folder AND everything inside
      // it (including subfolders) — it never moves messages to Trash, unlike what the confirmation
      // popup states. Move everything under the folder to Trash first, then hard-delete the now-
      // empty folder (see INTEG-2127).
      const searchResponse = await carbonioSoapRequest<any>(session, 'SearchRequest', {
        _jsns: 'urn:zimbraMail',
        limit: 1000,
        query: `underid:"${params.id}"`,
        types: 'message',
      });
      const messages = searchResponse?.m ?? searchResponse?.c ?? [];
      const ids = (Array.isArray(messages) ? messages : [messages]).map((m: any) => m.id).filter(Boolean);
      if (ids.length) {
        await carbonioMailsApi.mail.moveToTrash({ ids });
      }

      await carbonioSoapRequest<any>(session, 'FolderActionRequest', { action: { id: params.id, op: 'delete' } });
    },
    rename: async (params: { id: string }, payload: { name: string }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');
      await carbonioSoapRequest<any>(session, 'FolderActionRequest', { action: { id: params.id, name: payload.name, op: 'rename' } });
    },
  },
  folders: {
    get: async (params: { depth: number }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');
      const response = await carbonioSoapRequest<any>(session, 'GetFolderRequest', {
        depth: params.depth,
        folder: { l: '1' },
        view: 'message',
      });
      const SYSTEM_IDS = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17']);
      const mapFolder = (f: any, depth: number): IMailsFolder => ({
        depth,
        id: f.id,
        name: f.name,
        nbMessages: f.n ?? 0,
        nbUnread: f.u ?? 0,
        parent_id: f.l ?? null,
        subFolders: ((f.folder ?? []) as any[])
          .filter((sf: any) => !SYSTEM_IDS.has(sf.id))
          .map((sf: any) => mapFolder(sf, depth + 1)),
      });
      const root = response?.folder?.[0];
      if (!root) return [];
      return ((root.folder ?? []) as any[])
        .filter((f: any) => !SYSTEM_IDS.has(f.id))
        .map((f: any) => mapFolder(f, 1));
    },
  },
  mail: {
    delete: async (payload: { ids: string[] }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');
      if (!payload.ids.length) return;
      const ids = payload.ids.map(getItemId).join(',');
      await carbonioSoapRequest<any>(session, 'ItemActionRequest', { action: { id: ids, op: 'delete' } });
    },
    forward: async (params: { id: string }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');
      const safeId = getItemId(params.id);

      const currentMsg = await carbonioSoapRequest<any>(session, 'GetMsgRequest', {
        m: { html: 1, id: safeId, needExp: 1 },
      });
      const mp = currentMsg?.m?.[0]?.mp || [];
      const attachmentParts = collectAttachmentParts(mp);
      const inlineParts = collectInlineParts(mp);

      const m: any = {
        id: '-1',
        origid: safeId,
        rt: 'w',
      };
      if (inlineParts.length > 0) {
        m.mp = [{
          ct: 'multipart/related',
          mp: [
            { content: { _content: '' }, ct: 'text/html' },
            ...inlineParts.map((p: any) => ({
              attach: { mp: [{ mid: safeId, part: p.part }] },
              cd: 'inline',
              ci: normalizeCid(p.ci),
              ct: p.ct,
            })),
          ],
        }];
      } else {
        m.mp = [{ content: { _content: '' }, ct: 'text/html' }];
      }
      if (attachmentParts.length > 0) {
        m.attach = { mp: attachmentParts.map((p: any) => ({ mid: safeId, part: p.part })) };
      }

      const response = await carbonioSoapRequest<any>(session, 'SaveDraftRequest', { m });
      const draftId = response?.m?.[0]?.id;
      if (!draftId) throw new Error('Carbonio: failed to create forward draft');
      return draftId;
    },
    get: async (params: { id: string }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');

      const response = await carbonioSoapRequest<any>(session, 'GetMsgRequest', {
        m: {
          header: [
            { n: 'From' },
            { n: 'Authentication-Results' },
            { n: 'Sensitivity' },
            { n: 'List-ID' },
            { n: 'List-Unsubscribe' },
            { n: 'X-Zimbra-DL' },
            { n: 'Message-Id' },
            { n: 'Date' },
          ],
          html: 1,
          id: getItemId(params.id),
          max: 250000,
          needExp: 1,
          neuter: 0,
        },
      });

      const responseMessages = response?.m ?? [];
      const msg = responseMessages.length > 0 ? responseMessages[0] : null;
      if (!msg) throw new Error('Message not found');

      const backendMail = carbonioMessageToMailContentBackend(msg, params.id);
      const mail = mailContentAdapter(backendMail);

      if (mail.unread) {
        carbonioMailsApi.mail.toggleUnread({ ids: [mail.id], unread: false }).catch(e =>
          console.error('Failed to mark mail as read', e),
        );
      }

      return mail;
    },
    moveToFolder: async (params: { folderId: string }, payload: { ids: string[] }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');
      if (!payload.ids.length) return;
      const ids = payload.ids.map(getItemId).join(',');
      await carbonioSoapRequest<any>(session, 'MsgActionRequest', { action: { id: ids, l: params.folderId, op: 'move' } });
    },
    moveToTrash: async (payload: { ids: string[] }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');
      if (!payload.ids.length) return;
      const ids = payload.ids.map(getItemId).join(',');
      await carbonioSoapRequest<any>(session, 'ItemActionRequest', { action: { id: ids, op: 'trash' } });
    },
    recall: null,
    redirectToWebview: async (params: { id: string; folderId: string }) => {
      return `/auth/carbonio/preauth?callback=${encodeURIComponent(`${getCarbonioBaseUrl()}/carbonio/focus-mode/mail-view/folder/${params.folderId}/message/${params.id}`)}`;
    },
    removeFromFolder: async (params: { ids: string[] }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');
      if (!params.ids.length) return;
      const ids = params.ids.map(getItemId).join(',');
      await carbonioSoapRequest<any>(session, 'ItemActionRequest', { action: { id: ids, l: '2', op: 'move' } });
    },
    restore: null,
    send: async (params: { draftId?: string; inReplyTo?: string }, payload: MailsConversationPayload) => {
      const session = getSession();
      if (!session) throw new Error('No session found');

      const { body, cc, cci, subject, to } = payload;
      const toRecipients = to.map(email => ({ a: email, t: 't' }));
      const ccRecipients = cc.map(email => ({ a: email, t: 'c' }));
      const cciRecipients = cci.map(email => ({ a: email, t: 'b' }));
      const finalBody = normalizeFromMobileToWeb(body || '');

      if (params.draftId) {
        const safeId = getItemId(params.draftId);

        // Write the final draft state (cid: body + proper MIME structure) before sending.
        // SendMsgRequest with m.mp cannot include draft parts via attach.mp, so we commit
        // the full structure to the draft first, then send it with did only.
        const currentMsg = await carbonioSoapRequest<any>(session, 'GetMsgRequest', { m: { html: 1, id: safeId, needExp: 1 } });
        const currentMp = currentMsg?.m?.[0]?.mp || [];
        const regularParts = collectAttachmentParts(currentMp);
        const inlineParts = collectInlineParts(currentMp);
        const bodyWithCids = replaceInlineUrlsWithCids(finalBody, inlineParts);

        const draftM: any = {
          e: [...toRecipients, ...ccRecipients, ...cciRecipients],
          id: safeId,
          su: { _content: subject || '' },
        };
        if (inlineParts.length > 0) {
          draftM.mp = [{
            ct: 'multipart/related',
            mp: [
              { content: { _content: bodyWithCids }, ct: 'text/html' },
              ...inlineParts.map((p: any) => ({
                attach: { mp: [{ mid: safeId, part: p.part }] },
                cd: 'inline',
                ci: normalizeCid(p.ci),
                ct: p.ct,
              })),
            ],
          }];
        } else {
          draftM.mp = [{ content: { _content: bodyWithCids }, ct: 'text/html' }];
        }
        if (regularParts.length) {
          draftM.attach = { mp: regularParts.map((p: any) => ({ mid: safeId, part: p.part })) };
        }
        await carbonioSoapRequest<any>(session, 'SaveDraftRequest', { m: draftM });

        // sfd=1 (send-from-draft): Carbonio reuses the draft's stored MIME structure, recipients and
        // subject — without it, Carbonio ignores the draft's content and raises "No recipient addresses".
        const sendRequest: any = { m: { did: safeId, sfd: '1' } };
        if (params.inReplyTo) sendRequest.m.origid = params.inReplyTo;
        const response = await carbonioSoapRequest<any>(session, 'SendMsgRequest', sendRequest);
        return response ?? {};
      }

      // No draft yet — direct send without inline images.
      const sendRequest: any = {
        m: {
          e: [...toRecipients, ...ccRecipients, ...cciRecipients],
          mp: [{ content: { _content: finalBody }, ct: 'text/html' }],
          su: { _content: subject || '' },
        },
      };
      if (params.inReplyTo) sendRequest.m.origid = params.inReplyTo;
      const response = await carbonioSoapRequest<any>(session, 'SendMsgRequest', sendRequest);
      return response ?? {};
    },
    sendToDraft: async (params: { inReplyTo?: string }, payload: MailsConversationPayload) => {
      const session = getSession();
      if (!session) throw new Error('No session found');

      const { body, cc, cci, subject, to } = payload;

      // Build recipients
      const toRecipients = to.map(email => ({ a: email, t: 't' }));
      const ccRecipients = cc.map(email => ({ a: email, t: 'c' }));
      const cciRecipients = cci.map(email => ({ a: email, t: 'b' }));

      const finalBody = normalizeFromMobileToWeb(body || '');

      // When replying, copy inline parts from original so cid: references resolve correctly at send time
      let replyInlineParts: any[] = [];
      if (params.inReplyTo) {
        try {
          const origMsg = await carbonioSoapRequest<any>(session, 'GetMsgRequest', {
            m: { html: 1, id: getItemId(params.inReplyTo), needExp: 1 },
          });
          replyInlineParts = collectInlineParts(origMsg?.m?.[0]?.mp || []);
        } catch {
          // Don't block draft creation if fetching the original fails
        }
      }

      const draftRequest: any = {
        m: {
          e: [...toRecipients, ...ccRecipients, ...cciRecipients],
          id: '-1',
          su: {
            _content: subject || '',
          },
        },
      };

      if (params.inReplyTo) {
        draftRequest.m.origid = params.inReplyTo;
      }

      if (replyInlineParts.length > 0) {
        draftRequest.m.mp = [{
          ct: 'multipart/related',
          mp: [
            { content: { _content: finalBody }, ct: 'text/html' },
            ...replyInlineParts.map((p: any) => ({
              attach: { mp: [{ mid: getItemId(params.inReplyTo!), part: p.part }] },
              cd: 'inline',
              ci: normalizeCid(p.ci),
              ct: p.ct,
            })),
          ],
        }];
      } else {
        draftRequest.m.mp = [{ content: { _content: finalBody }, ct: 'text/html' }];
      }

      const response = await carbonioSoapRequest<any>(session, 'SaveDraftRequest', draftRequest);
      const draftId = response?.m?.[0]?.id;
      if (!draftId) {
        throw new Error('Failed to save draft');
      }
      return draftId;
    },
    toggleUnread: async (payload: { ids: string[]; unread: boolean }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');
      if (!payload.ids.length) return;
      const ids = payload.ids.map(getItemId).join(',');
      await carbonioSoapRequest<any>(session, 'MsgActionRequest', {
        action: { id: ids, op: payload.unread ? '!read' : 'read' },
      });
    },
    updateDraft: async (params: { draftId: string }, payload: MailsConversationPayload) => {
      const session = getSession();
      if (!session) throw new Error('No session found');

      const { body, cc, cci, subject, to } = payload;
      const toRecipients = to.map(email => ({ a: email, t: 't' }));
      const ccRecipients = cc.map(email => ({ a: email, t: 'c' }));
      const cciRecipients = cci.map(email => ({ a: email, t: 'b' }));
      const id = getItemId(params.draftId);

      const currentMsg = await carbonioSoapRequest<any>(session, 'GetMsgRequest', { m: { html: 1, id, needExp: 1 } });
      const currentMp = currentMsg?.m?.[0]?.mp || [];
      const regularParts = collectAttachmentParts(currentMp);
      const inlineParts = collectInlineParts(currentMp);

      const finalBody = normalizeFromMobileToWeb(body || '');
      const bodyWithCids = replaceInlineUrlsWithCids(finalBody, inlineParts);

      const m: any = {
        e: [...toRecipients, ...ccRecipients, ...cciRecipients],
        id,
        su: { _content: subject || '' },
      };
      if (inlineParts.length > 0) {
        m.mp = [{
          ct: 'multipart/related',
          mp: [
            { content: { _content: bodyWithCids }, ct: 'text/html' },
            ...inlineParts.map((p: any) => ({
              attach: { mp: [{ mid: id, part: p.part }] },
              cd: 'inline',
              ci: normalizeCid(p.ci),
              ct: p.ct,
            })),
          ],
        }];
      } else {
        m.mp = [{ content: { _content: bodyWithCids }, ct: 'text/html' }];
      }
      if (regularParts.length) {
        m.attach = { mp: regularParts.map((p: any) => ({ mid: id, part: p.part })) };
      }

      await carbonioSoapRequest<any>(session, 'SaveDraftRequest', { m });
    },
  },
  mails: {
    get: async (_params: { folderId: string; pageNb: number; pageSize: number; search?: string }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');
      const response = await carbonioSoapRequest<any>(session, 'SearchRequest', {
        _jsns: 'urn:zimbraMail',
        limit: _params.pageSize,
        locale: {
          _content: 'fr',
        },
        needExp: 1,
        offset: _params.pageNb * _params.pageSize,
        query: _params.search ? _params.search : folderIdSwitch(_params.folderId),
        recip: '2',
        sortBy: 'dateDesc',
        types: 'message',
        wantContent: 'full',
      });

      const carbonioMessages = response?.m ?? response?.c ?? [];
      const list = Array.isArray(carbonioMessages) ? carbonioMessages : [carbonioMessages];

      const backendMails = list.map((msg: any) => carbonioMessageToMailPreviewBackend(msg));
      return backendMails.map(mail => mailsAdapter(mail));
    },
  },
  signature: {
    get: null,
    update: null,
  },
  visibles: {
    get: null,
    getOnSearch: async (query: string = '') => {
      const session = getSession();
      if (!session) throw new Error('No session found');

      const response = await carbonioSoapRequest<any>(
        session,
        'FullAutocompleteRequest',
        {
          _jsns: 'urn:zimbraMail',
          AutoCompleteRequest: {
            includeGal: 1,
            name: query || '',
          },
        },
        true,
      );

      const contacts = response?.match || [];
      const visibles: MailsVisibleBackend[] = contacts.map((contact: any) => {
        const type = 'External';
        return {
          displayName: contact.display || contact.name || contact.email || '',
          id: contact.email || '',
          profile: contact.profile || '',
          type: type,
          usedIn: ['TO', 'CC', 'CCI'],
          ...(contact.groupType && { groupType: contact.groupType }),
          ...(contact.nbUsers && { nbUsers: contact.nbUsers }),
        };
      });

      return visibles.map(visible => mailVisibleAdapter(visible));
    },
  },
};
