import { decode } from 'html-entities';

import { getSession } from '~/framework/modules/auth/reducer';
import { DraftType, IDraft, IMail, IRecipient } from '~/framework/modules/zimbra/model';

const FORWARD_PREFIX = 'Tr : ';
const REPLY_PREFIX = 'Re : ';

const getRecipientName = (displayNames: string[][], id: string): string =>
  displayNames.find(displayName => displayName[0] === id)?.[1] ?? '';

const getRecipient = (displayNames: string[][], id: string): IRecipient => ({
  id,
  displayName: getRecipientName(displayNames, id),
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
        to: [getRecipient(mail.displayNames, mail.from)],
        subject: REPLY_PREFIX + mail.subject,
        threadBody: getThreadBody(mail),
        inReplyTo: mail.id,
      };
    }
    case DraftType.REPLY_ALL: {
      return {
        to: [
          getRecipient(mail.displayNames, mail.from),
          ...mail.to.filter(id => id !== getSession()?.user.id).map(id => getRecipient(mail.displayNames, id)),
        ],
        cc: mail.cc.filter(id => id !== mail.from).map(id => getRecipient(mail.displayNames, id)),
        subject: REPLY_PREFIX + mail.subject,
        threadBody: getThreadBody(mail),
        inReplyTo: mail.id,
      };
    }
    case DraftType.FORWARD: {
      return {
        subject: FORWARD_PREFIX + mail.subject,
        body: '',
        threadBody: getThreadBody(mail),
        attachments: mail.attachments,
        inReplyTo: mail.id,
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
        to: mail.to.map(id => getRecipient(mail.displayNames, id)),
        cc: mail.cc.map(id => getRecipient(mail.displayNames, id)),
        bcc: mail.bcc.map(id => getRecipient(mail.displayNames, id)),
        subject: mail.subject,
        body: deleteHtmlContent(mail.body),
        threadBody,
        attachments: mail.attachments,
      };
    }
    default:
      return {};
  }
};
