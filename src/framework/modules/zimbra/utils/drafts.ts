import { decode } from 'html-entities';

import { getSession } from '~/framework/modules/auth/reducer';
import { DraftType, IDraft, IMail, IRecipient } from '~/framework/modules/zimbra/model';

const FORWARD_PREFIX = 'Tr : ';
const REPLY_PREFIX = 'Re : ';

const getRecipientName = (displayNames: string[][], id: string): string =>
  displayNames.find(displayName => displayName[0] === id)?.[1] ?? '';

const getRecipient = (displayNames: string[][], id: string): IRecipient => ({
  displayName: getRecipientName(displayNames, id),
  id,
});

const deleteHtmlContent = (text: string): string => {
  const regexp = /<(\S+)[^>]*>(.*)<\/\1>/gs;

  if (regexp.test(text)) {
    return deleteHtmlContent(text.replace(regexp, '$2'));
  } else {
    return decode(text);
  }
};

const getThreadBody = (mail: IMail): string => {
  let header =
    '<br>' +
    '<br>' +
    '<p class="row ng-scope"></p>' +
    '<hr class="ng-scope">' +
    '<p class="ng-scope"></p>' +
    '<p class="medium-text ng-scope">' +
    '<span translate="" key="transfer.from"><span class="no-style ng-scope">De :</span></span>' +
    `<em class="ng-binding"> ${getRecipientName(mail.displayNames, mail.from)}</em>` +
    '<br>' +
    '<span class="medium-importance" translate="" key="transfer.date"><span class="no-style ng-scope">Date :</span></span>' +
    `<em class="ng-binding"> ${mail.date.format('dddd D MMMM Y')}</em>` +
    '<br>' +
    '<span class="medium-importance" translate="" key="transfer.subject"><span class="no-style ng-scope">Objet :</span></span>' +
    `<em class="ng-binding"> ${mail.subject}</em>` +
    '<br>' +
    '<span class="medium-importance" translate="" key="transfer.to"><span class="no-style ng-scope">À :</span></span>' +
    `<em class="ng-binding"> ${mail.to.map(id => getRecipientName(mail.displayNames, id)).join(', ')}</em>`;

  if (mail.cc.length) {
    header +=
      '<br>' +
      '<span class="medium-importance" translate="" key="transfer.cc"><span class="no-style ng-scope">Copie à :</span></span>' +
      `<em class="ng-binding"> ${mail.cc.map(id => getRecipientName(mail.displayNames, id)).join(', ')}</em>`;
  }
  header += `</p><blockquote class="ng-scope">${mail.body}</blockquote>`;
  return header;
};

export const initDraftFromMail = (mail: IMail, draftType: DraftType): Partial<IDraft> => {
  switch (draftType) {
    case DraftType.REPLY: {
      return {
        inReplyTo: mail.id,
        subject: REPLY_PREFIX + mail.subject,
        threadBody: getThreadBody(mail),
        to: [getRecipient(mail.displayNames, mail.from)],
      };
    }
    case DraftType.REPLY_ALL: {
      return {
        cc: mail.cc.filter(id => id !== mail.from).map(id => getRecipient(mail.displayNames, id)),
        inReplyTo: mail.id,
        subject: REPLY_PREFIX + mail.subject,
        threadBody: getThreadBody(mail),
        to: [
          getRecipient(mail.displayNames, mail.from),
          ...mail.to.filter(id => id !== getSession()?.user.id).map(id => getRecipient(mail.displayNames, id)),
        ],
      };
    }
    case DraftType.FORWARD: {
      return {
        attachments: mail.attachments,
        body: '',
        inReplyTo: mail.id,
        subject: FORWARD_PREFIX + mail.subject,
        threadBody: getThreadBody(mail),
      };
    }
    case DraftType.DRAFT: {
      let threadBody = '';
      if (mail.body) {
        // Slice replied/forwarded mail information from body and assign it to threadBody
        const index = mail.body.indexOf('<br /><br /><p class="row ng-scope"></p>');
        if (index !== -1) {
          threadBody = mail.body.slice(index);
          mail.body = mail.body.slice(0, index);
        }
      }
      return {
        attachments: mail.attachments,
        bcc: mail.bcc.map(id => getRecipient(mail.displayNames, id)),
        body: deleteHtmlContent(mail.body),
        cc: mail.cc.map(id => getRecipient(mail.displayNames, id)),
        id: mail.id,
        subject: mail.subject,
        threadBody,
        to: mail.to.map(id => getRecipient(mail.displayNames, id)),
      };
    }
    default:
      return {};
  }
};

export const isSignatureRich = (content: string): boolean => /<\/?[a-z][\s\S]*>/i.test(content);
