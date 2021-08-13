import moment from 'moment';
import { Platform } from 'react-native';

import generateUuid from '../../utils/uuid';
import Conf from '../../../ode-framework-conf';
import { signedFetch } from '../../infra/fetchWithCache';
import mailboxConfig from '../config';
import { IArrayById } from '../../infra/collections';
import { getSessionInfo } from '../../App';
import { conversationThreadSelected } from './threadSelected';
import { IAttachment } from './messages';
import { Trackers } from '../../infra/tracker';
import { ILocalAttachment, IRemoteAttachment } from '../../ui/Attachment';
import { Alert } from 'react-native';

// TYPE DEFINITIONS -------------------------------------------------------------------------------

export interface IConversationMessage {
  // It's like an IMessage ! LOL !
  id: string; // Message's own id
  parentId: string; // Id of the message that it reply to
  subject: string; // Subject of the message
  body: string; // Content of the message. It's HTML.
  from: string; // User id of the sender
  fromName: string; // Name of the sender
  to: string[]; // User Ids of the receivers
  toName: string[]; // Name of the receivers
  cc: string[]; // User Ids of the copy receivers
  ccName: string[]; // Name of the copy receivers
  displayNames: string[][]; // [0: id, 1: displayName] for each person concerned by this message.
  date: moment.Moment; // DateTime of the message
  oldThreadId: string; // Old id of the thread
  threadId: string; // Id of the thread (Id of the first message in this thread).
  unread: boolean; // Self-explaining
  rownum: number; // number of the message in the thread (starting from 1 from the newest to the latest).
  status: ConversationMessageStatus; // sending status of the message
  attachments: Array<IRemoteAttachment>;
}

export type IConversationMessageList = IArrayById<IConversationMessage>;
export type IConversationMessageNativeArray = IConversationMessage[]; // Used when th order of received data needs to be kept.

export enum ConversationMessageStatus {
  sent,
  sending,
  failed,
}

//--------------------------------------------------------------
export const actionTypeDraftCreateRequested = mailboxConfig.createActionType('DRAFT_REQUESTED');
export const actionTypeDraftCreated = mailboxConfig.createActionType('DRAFT_OK');
export const actionTypeDraftCreateError = mailboxConfig.createActionType('DRAFT_FAILURE');

export const actionTypeAttachmentsSendRequested = mailboxConfig.createActionType('ATTACHMENTS_SEND_REQUESTED');
export const actionTypeAttachmentsSent = mailboxConfig.createActionType('ATTACHMENTS_SEND_OK');
export const actionTypeAttachmentsSendError = mailboxConfig.createActionType('ATTACHMENTS_SEND_FAILURE');

export const actionTypeMessageSendRequested = mailboxConfig.createActionType('SEND_REQUESTED');
export const actionTypeMessageSent = mailboxConfig.createActionType('SEND_OK');
export const actionTypeMessageSendError = mailboxConfig.createActionType('SEND_FAILURE');

export function createDraft(data: IConversationMessage) {
  return async dispatch => {
    const newuuid = `tmp-${generateUuid()}`;
    const fulldata = {
      ...data,
      date: moment(),
      from: getSessionInfo().userId,
      id: newuuid,
      status: ConversationMessageStatus.sending,
    };
    dispatch({
      data: fulldata,
      type: actionTypeDraftCreateRequested,
    });

    try {
      let replyTo = '';
      if (fulldata.parentId) {
        replyTo = `In-Reply-To=${fulldata.parentId}`;
      }
      const requestbody = {
        body: fulldata.body,
        cc: fulldata.cc,
        subject: fulldata.subject,
        to: fulldata.to,
      };
      if (!Conf.currentPlatform) throw new Error('must specify a platform');
      const response = await signedFetch(`${(Conf.currentPlatform as any).url}/conversation/draft?${replyTo}`, {
        body: JSON.stringify(requestbody),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      const json = await response.json();
      const messageId = json.id;

      const fulldata2 = {
        ...fulldata,
        date: moment(),
        from: getSessionInfo().userId,
        newId: messageId,
        oldId: newuuid,
        parentId: fulldata.parentId,
        oldThreadId: fulldata.threadId,
        threadId: json.thread_id || (fulldata?.threadId?.startsWith('tmp-') ? json.id : fulldata.threadId),
      };
      dispatch({
        data: fulldata2,
        type: actionTypeDraftCreated,
      });
      fulldata2.oldThreadId !== fulldata2.threadId && dispatch(conversationThreadSelected(fulldata2.threadId));
      return messageId;
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.warn(e);
      dispatch({
        data: {
          ...data,
          oldId: newuuid,
          conversation: data.parentId,
          date: Date.now(),
          from: getSessionInfo().userId,
          threadId: data.threadId,
        },
        type: actionTypeDraftCreateError,
      });
    }
  };
}

export function sendAttachments(attachments: ILocalAttachment[], messageId: string, backMessage?: IConversationMessage) {
  return async dispatch => {
    const fulldata = {
      attachments,
      messageId,
      date: moment(),
      from: getSessionInfo().userId,
      status: ConversationMessageStatus.sending,
    };
    dispatch({
      data: fulldata,
      type: actionTypeAttachmentsSendRequested,
    });
    try {
      if (!Conf.currentPlatform) throw new Error('must specify a platform');
      const remoteAttachments = attachments.filter(att => att.hasOwnProperty('id'));
      const attachmentUploads = attachments
        .map((att: ILocalAttachment | IRemoteAttachment) => {
          if (att.hasOwnProperty('id')) return;
          const attachment = att as ILocalAttachment;
          let formData = new FormData();
          formData.append('file', {
            uri: (Platform.OS === 'android' ? 'file://' : '') + attachment.uri,
            type: attachment.mime,
            name: attachment.name,
          } as any);
          console.log('formdata:', formData);
          return signedFetch(`${(Conf.currentPlatform as any).url}/conversation/message/${messageId}/attachment`, {
            body: formData,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
            },
            method: 'POST',
          });
        })
        .filter(e => e !== undefined);
      // console.log("remote attachments:", remoteAttachments);
      // console.log("local attachments:", attachmentUploads);
      // console.log("back message:", backMessage);
      if (backMessage) {
        const transferResponse = await signedFetch(
          `${(Conf.currentPlatform as any).url}/conversation/message/${messageId}/forward/${backMessage.id}`,
          {
            method: 'PUT',
          },
        );
      }
      const responses = await Promise.all(attachmentUploads);
      const sentAttachmentIds = await Promise.all(
        responses.map(async res => {
          const parsedRes = await res.json();
          return parsedRes.id;
        }),
      );
      const sentAttachments = sentAttachmentIds.map((sentAttachmentId, index) => ({
        id: sentAttachmentId,
        filename: attachments[index].name,
        contentType: attachments[index].mime,
      }));

      const fulldata2 = {
        ...fulldata,
        date: moment(),
        from: getSessionInfo().userId,
        sentAttachments: [...remoteAttachments, ...sentAttachments],
      };
      dispatch({
        data: fulldata2,
        type: actionTypeAttachmentsSent,
      });
      Trackers.trackEvent('Conversation', 'SEND ATTACHMENTS', '', attachments.length);
      // console.log("sent Attchments in sendMEssage.tsx", fulldata2.sentAttachments);
      return fulldata2.sentAttachments;
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.warn(e);
      dispatch({
        data: {
          messageId,
          attachments,
          date: Date.now(),
          from: getSessionInfo().userId,
        },
        type: actionTypeAttachmentsSendError,
      });
    }
  };
}

export function sendMessage(data: IConversationMessage, sentAttachments?: IAttachment[], messageId?: string) {
  return async dispatch => {
    const newuuid = `tmp-${generateUuid()}`;
    const fulldata = {
      ...data,
      messageId,
      attachments: sentAttachments,
      date: moment(),
      from: getSessionInfo().userId,
      id: newuuid,
      status: ConversationMessageStatus.sending,
    };
    // console.log("fuldata 1", fulldata);
    dispatch({
      data: fulldata,
      type: actionTypeMessageSendRequested,
    });

    try {
      let replyTo = '';
      if (fulldata.parentId) {
        replyTo = `In-Reply-To=${fulldata.parentId}`;
      }
      let id = '';
      if (messageId) {
        id = `id=${messageId}&`;
      }
      const requestbody = {
        body: fulldata.body,
        cc: fulldata.cc,
        subject: fulldata.subject,
        to: fulldata.to,
      };
      if (!Conf.currentPlatform) throw new Error('must specify a platform');
      const response = await signedFetch(`${(Conf.currentPlatform as any).url}/conversation/send?${id}${replyTo}`, {
        body: JSON.stringify(requestbody),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      const json = await response.json();

      const fulldata2 = {
        ...fulldata,
        date: moment(),
        from: getSessionInfo().userId,
        newId: json.id,
        oldId: newuuid,
        parentId: fulldata.parentId,
        oldThreadId: fulldata.threadId,
        threadId: json.thread_id || (fulldata?.threadId?.startsWith('tmp-') ? json.id : fulldata.threadId),
      };
      dispatch({
        data: fulldata2,
        type: actionTypeMessageSent,
      });
      fulldata2.oldThreadId !== fulldata2.threadId && dispatch(conversationThreadSelected(fulldata2.threadId));
      // console.log("fulldata", fulldata2);
      Trackers.trackEvent('Conversation', 'SEND');
      return fulldata2.attachments;
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.warn(e);
      dispatch({
        data: {
          ...data,
          oldId: newuuid,
          conversation: data.parentId,
          date: Date.now(),
          from: getSessionInfo().userId,
          threadId: data.threadId,
        },
        type: actionTypeMessageSendError,
      });
    }
  };
}
