import {
  carbonioMessageToMailContentBackend,
  carbonioMessageToMailPreviewBackend,
  removeConversationHistoryFromBody,
} from '../adapters/carbonio';
import { mailContentAdapter, mailsAdapter, MailsVisibleBackend, mailVisibleAdapter } from '../adapters/mails';

import { getStore } from '~/app/store';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { actions as authActions, getSession } from '~/framework/modules/auth/reducer';
import { MailsConversationPayload } from '~/framework/modules/mails/model';
import { sessionFetch } from '~/framework/util/transport';

// Carbonio SOAP API base URL
const CARBONIO_SOAP_BASE_URL = 'https://mail.lyceeconnecte.fr/service/soap';

/**
 * Get Carbonio authToken from token endpoint
 */
export async function getCarbonioAuthToken(_: AuthActiveAccount): Promise<string> {
  // get token from /auth/carbonio/token

  const responseText = await sessionFetch.text('/auth/carbonio/token', { method: 'GET' });
  const token = responseText.trim();

  const session = getSession();
  if (!session) throw new Error('No session found');
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
  const response = await sessionFetch(`${CARBONIO_SOAP_BASE_URL}/GetInfoRequest`, {
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
 * Make SOAP request to Carbonio API
 */
async function carbonioSoapRequest<T>(
  session: AuthActiveAccount,
  requestName: string,
  requestBody: any,
  withContentName: boolean = false,
): Promise<T> {
  let authToken = getStore().getState().auth.accounts[session.user.id]?.tokens.carbonioToken;

  if (!authToken) {
    authToken = await getCarbonioAuthToken(session);
    if (!authToken) {
      throw new Error('Carbonio auth token not found');
    }
  }

  const soapBody = buildSoapRequest(
    authToken,
    requestName,
    requestBody,
    withContentName
      ? (getStore().getState().auth.accounts[session.user.id]?.carbonioUserInfos?.name ?? `${session.user.login}@lyceeconnecte.fr`)
      : '',
  );

  const response = await sessionFetch(`${CARBONIO_SOAP_BASE_URL}/${requestName}`, {
    body: JSON.stringify(soapBody),
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `ZM_AUTH_TOKEN=${authToken}`,
    },
    method: 'POST',
  });

  if (!response.ok) {
    const bodyText = await response.text();
    let detail = bodyText;
    try {
      const bodyJson = JSON.parse(bodyText);
      const fault = bodyJson?.Body?.Fault ?? bodyJson?.Fault;
      if (fault) {
        detail = fault.Reason?.Text?._content ?? fault.Detail?.Error?.Message ?? JSON.stringify(fault);
      }
    } catch {
      // keep bodyText as detail
    }
    throw new Error(`Carbonio SOAP request failed (${response.status}): ${detail}`);
  }

  const data = await response.json();
  // Extract response from SOAP format
  const responseKey = `${requestName}Response`;
  return data.Body?.[responseKey] || data;
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
      return 'inId:"2"';
  }
};

export const defaultUserIdCarbonio = (session: AuthActiveAccount | undefined) => {
  if (!session) return '';
  return getStore().getState().auth.accounts[session.user.id]?.carbonioUserInfos?.name ?? `${session.user.login}@lyceeconnecte.fr`;
};
const getItemId = (id: string) => {
  if (id === null || id === undefined) {
    throw new Error('Invalid id');
  }

  // if id start with - remove the -
  const finalId = id.startsWith('-') ? id.slice(1) : id;
  return finalId;
};
export const carbonioMailsApi = {
  attachments: {
    add: null,
    allowMultimediaUpload: false,
    remove: null,
    supportViewAttachments: false,
  },
  bookmarks: {
    getById: null,
  },
  folder: {
    count: null,
    create: null,
    delete: null,
    rename: null,
  },
  folders: {
    get: null,
  },
  mail: {
    delete: async (payload: { ids: string[] }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');

      for (const itemId of payload.ids) {
        const id = getItemId(itemId);
        // ItemActionRequest with action="delete"
        await carbonioSoapRequest<any>(session, 'ItemActionRequest', {
          _jsns: 'urn:zimbraMail',
          action: {
            id: id,
            op: 'delete',
          },
        });
      }
    },
    forward: null,
    // forward: async (params: { id: string }) => {
    //   const session = getSession();
    //   if (!session) throw new Error('No session found');

    //   const id = getItemId(params.id);

    //   console.error('Carbonio Forward id', id);
    //   // Get the original message first
    //   const getMsgResponse = await carbonioSoapRequest<any>(session, 'GetConvRequest', {
    //     _jsns: 'urn:zimbraMail',
    //     c: {
    //       fetch: 'all',
    //       header: [
    //         {
    //           n: 'From',
    //         },
    //         {
    //           n: 'Authentication-Results',
    //         },
    //         {
    //           n: 'Sensitivity',
    //         },
    //         {
    //           n: 'List-ID',
    //         },
    //         {
    //           n: 'List-Unsubscribe',
    //         },
    //         {
    //           n: 'X-Zimbra-DL',
    //         },
    //         {
    //           n: 'Message-Id',
    //         },
    //         {
    //           n: 'Date',
    //         },
    //       ],
    //       html: 1,
    //       id: id,
    //       needExp: 1,
    //     },
    //   });

    //   const originalMsg = getMsgResponse.Body?.GetConvResponse?.c?.[0] ?? null;
    //   console.error('Carbonio Forward originalMsg', originalMsg);
    //   if (!originalMsg) {
    //     throw new Error('Message not found');
    //   }

    //   console.error('Carbonio Forward originalMsg', originalMsg);

    //   // Create a draft with forward flag
    //   const draftResponse = await carbonioSoapRequest<any>(session, 'SaveDraftRequest', {
    //     _jsns: 'urn:zimbraMail',
    //     m: {
    //       fr: {
    //         _content: '',
    //       },
    //       fwd: {
    //         id: id,
    //       },
    //       id: '-1',
    //       mp: originalMsg.mp || [],
    //       su: {
    //         _content: originalMsg.su?._content ? `Fwd: ${originalMsg.su._content}` : 'Fwd:',
    //       },
    //     },
    //   });

    //   const draftId = draftResponse.Body?.SaveDraftResponse?.m?.[0]?.id;
    //   if (!draftId) {
    //     throw new Error('Failed to create forward draft');
    //   }

    //   return draftId;
    // },
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
          id: params.id,
          max: 250000,
          needExp: 1,
        },
      });

      const responseMessages = response?.Body?.GetMsgResponse?.m ?? [];
      const msg = responseMessages.length > 0 ? responseMessages[0] : null;
      if (!msg) throw new Error('Message not found');

      const backendMail = carbonioMessageToMailContentBackend(msg, params.id);
      const mail = mailContentAdapter(backendMail);

      if (mail.unread) {
        await carbonioMailsApi.mail.toggleUnread({ ids: [mail.id], unread: false });
      }

      return mail;
    },
    moveToFolder: null,
    moveToTrash: async (payload: { ids: string[] }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');

      for (const itemId of payload.ids) {
        const id = getItemId(itemId);

        // ItemActionRequest with action="trash"
        await carbonioSoapRequest<any>(session, 'ItemActionRequest', {
          _jsns: 'urn:zimbraMail',
          action: {
            id: id,
            op: 'trash',
          },
        });
      }
    },
    recall: null,
    rederictToWebview: async (params: { id: string; folderId: string }) => {
      return `/auth/carbonio/preauth?callback=${encodeURIComponent(`https://mail.lyceeconnecte.fr/carbonio/focus-mode/mail-view/folder/${params.folderId}/message/${params.id}`)}`;
    },
    removeFromFolder: async (params: { ids: string[] }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');

      for (const itemId of params.ids) {
        const id = getItemId(itemId);

        // MoveRequest to move items to root (inbox)
        await carbonioSoapRequest<any>(session, 'MoveRequest', {
          _jsns: 'urn:zimbraMail',
          id: id,
          l: '2', // Inbox folder ID
        });
      }
    },
    restore: null,
    send: async (params: { draftId?: string; inReplyTo?: string }, payload: MailsConversationPayload) => {
      const session = getSession();
      if (!session) throw new Error('No session found');

      const { body, cc, cci, subject, to } = payload;

      // Build recipients
      const toRecipients = to.map(email => ({ a: email, t: 't' }));
      const ccRecipients = cc.map(email => ({ a: email, t: 'c' }));
      const cciRecipients = cci.map(email => ({ a: email, t: 'b' }));

      const finalBody = removeConversationHistoryFromBody(body || '');

      const sendRequest: any = {
        _jsns: 'urn:zimbraMail',
        m: {
          e: [...toRecipients, ...ccRecipients, ...cciRecipients],
          mp: [
            {
              content: {
                _content: finalBody,
              },
              ct: 'text/html',
            },
          ],
          su: {
            _content: subject || '',
          },
        },
      };

      if (params.draftId) {
        sendRequest.m.did = params.draftId;
      }

      if (params.inReplyTo) {
        sendRequest.m.origid = params.inReplyTo;
      }

      const response = await carbonioSoapRequest<any>(session, 'SendMsgRequest', sendRequest);
      return response.Body?.SendMsgResponse || {};
    },
    sendToDraft: async (params: { inReplyTo?: string }, payload: MailsConversationPayload) => {
      const session = getSession();
      if (!session) throw new Error('No session found');

      const { body, cc, cci, subject, to } = payload;

      // Build recipients
      const toRecipients = to.map(email => ({ a: email, t: 't' }));
      const ccRecipients = cc.map(email => ({ a: email, t: 'c' }));
      const cciRecipients = cci.map(email => ({ a: email, t: 'b' }));

      const finalBody = removeConversationHistoryFromBody(body || '');

      const draftRequest: any = {
        _jsns: 'urn:zimbraMail',
        m: {
          e: [...toRecipients, ...ccRecipients, ...cciRecipients],
          id: '-1',
          mp: [
            {
              content: {
                _content: finalBody,
              },
              ct: 'text/html',
            },
          ],
          su: {
            _content: subject || '',
          },
        },
      };

      if (params.inReplyTo) {
        draftRequest.m.origid = params.inReplyTo;
      }

      const response = await carbonioSoapRequest<any>(session, 'SaveDraftRequest', draftRequest);
      const draftId = response.Body?.SaveDraftResponse?.m?.[0]?.id;
      if (!draftId) {
        throw new Error('Failed to save draft');
      }
      return draftId;
    },
    toggleUnread: async (payload: { ids: string[]; unread: boolean }) => {
      const session = getSession();
      if (!session) throw new Error('No session found');

      for (const itemId of payload.ids) {
        const id = getItemId(itemId);

        // ItemActionRequest with action="read" or "!read"
        await carbonioSoapRequest<any>(session, 'MsgActionRequest', {
          _jsns: 'urn:zimbraMail',
          action: {
            id: id,
            op: payload.unread ? '!read' : 'read',
          },
        });
      }
    },
    updateDraft: async (params: { draftId: string }, payload: MailsConversationPayload) => {
      const session = getSession();
      if (!session) throw new Error('No session found');

      const { body, cc, cci, subject, to } = payload;

      // Build recipients
      const toRecipients = to.map(email => ({ a: email, t: 't' }));
      const ccRecipients = cc.map(email => ({ a: email, t: 'c' }));
      const cciRecipients = cci.map(email => ({ a: email, t: 'b' }));
      const id = getItemId(params.draftId);

      const finalBody = removeConversationHistoryFromBody(body || '');

      await carbonioSoapRequest<any>(session, 'SaveDraftRequest', {
        _jsns: 'urn:zimbraMail',
        m: {
          e: [...toRecipients, ...ccRecipients, ...cciRecipients],
          id: id,
          mp: [
            {
              content: {
                _content: finalBody,
              },
              ct: 'text/html',
            },
          ],
          su: {
            _content: subject || '',
          },
        },
      });
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

      const searchResponse = response?.Body?.SearchResponse ?? response;
      const carbonioMessages = searchResponse.m ?? searchResponse.c ?? [];
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

      const contacts = response.Body?.FullAutocompleteResponse?.match || [];
      const visibles: MailsVisibleBackend[] = contacts.map((contact: any) => {
        const type = 'External';
        return {
          displayName: contact.display || contact.name || contact.email || '',
          id: contact.id || contact.email || '',
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
