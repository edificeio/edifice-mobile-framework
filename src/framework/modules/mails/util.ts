import moment from 'moment';
import { I18n } from '~/app/i18n';
import { IDistantFileWithId } from '~/framework/util/fileHandler';
import { urlSigner } from '~/infra/oauth';
import {
  IMailsFolder,
  IMailsMailAttachment,
  MailsDefaultFolders,
  MailsRecipientGroupInfo,
  MailsRecipientInfo,
  MailsRecipients,
  MailsRecipientsType,
  MailsVisible,
  MailsVisibleType,
} from './model';

export const MailsRecipientPrefixsI18n = {
  [MailsRecipientsType.TO]: {
    name: 'mails-prefixto',
    placeholder: 'mails-prefixto-placeholder',
  },
  [MailsRecipientsType.CC]: {
    name: 'mails-prefixcc',
    placeholder: 'mails-prefixcc-placeholder',
  },
  [MailsRecipientsType.CCI]: {
    name: 'mails-prefixcci',
    placeholder: 'mails-prefixcci-placeholder',
  },
};

export function mailsFormatRecipients(
  to: MailsRecipients,
  cc: MailsRecipients,
  cci: MailsRecipients,
): { text: string; ids: string[] } {
  const formatPart = (prefixKey: string, recipients: MailsRecipients): string | null => {
    const names = recipients.users.map(user => user.displayName).join(', ');
    const groups = recipients.groups.map(group => group.displayName).join(', ');
    const combined = [names, groups].filter(Boolean).join(' ');
    return combined ? `${I18n.get(prefixKey)} ${combined}` : null;
  };

  const extractIds = (recipients: MailsRecipients): string[] => [
    ...recipients.users.map(user => user.id),
    ...recipients.groups.map(group => group.id),
  ];

  const parts = [formatPart('mails-prefixto', to), formatPart('mails-prefixcc', cc), formatPart('mails-prefixcci', cci)].filter(
    Boolean,
  );

  const ids = [...extractIds(to), ...extractIds(cc), ...extractIds(cci)];

  return {
    text: parts.length > 0 ? parts.join(' ') : I18n.get('mails-list-norecipient'),
    ids,
  };
}

export function convertAttachmentToDistantFile(attachment: IMailsMailAttachment, mailId: string): IDistantFileWithId {
  return {
    id: attachment.id,
    filename: attachment.filename,
    filesize: attachment.size,
    filetype: attachment.contentType,
    url: urlSigner.getAbsoluteUrl(`/conversation/message/${mailId}/attachment/${attachment.id}`) ?? '',
  };
}

export function convertRecipientUserInfoToVisible(userInfo: MailsRecipientInfo): MailsVisible {
  return {
    id: userInfo.id,
    displayName: userInfo.displayName,
    profile: userInfo.profile,
    groupDisplayName: '',
    structureName: '',
    type: MailsVisibleType.USER,
  };
}

export function convertRecipientGroupInfoToVisible(groupInfo: MailsRecipientGroupInfo): MailsVisible {
  return {
    id: groupInfo.id,
    displayName: groupInfo.displayName,
    profile: undefined,
    groupDisplayName: '',
    structureName: '',
    type: MailsVisibleType.GROUP,
  };
}

export const flattenFolders = (folders: IMailsFolder[]) => {
  const result: IMailsFolder[] = [];

  folders.forEach(folder => {
    result.push(folder);
    if (folder.subFolders) {
      result.push(...flattenFolders(folder.subFolders));
    }
  });

  return result;
};

export const mailsDefaultFoldersInfos = {
  [MailsDefaultFolders.INBOX]: {
    icon: 'ui-depositeInbox',
    title: 'mails-list-inbox',
  },
  [MailsDefaultFolders.OUTBOX]: {
    icon: 'ui-send',
    title: 'mails-list-outbox',
  },
  [MailsDefaultFolders.DRAFTS]: {
    icon: 'ui-edit',
    title: 'mails-list-drafts',
  },
  [MailsDefaultFolders.TRASH]: {
    icon: 'ui-delete',
    title: 'mails-list-trash',
  },
};

export function addHtmlForward(from: MailsRecipientInfo, to: MailsVisible[], subject: string, body: string): string {
  return `<br><br><div>-----Message transféré-----</div><div>De: ${from?.displayName}</div><div>Date: ${moment().format('DD/MM/YYYY hh:mm')}</div><div>Objet: ${subject}</div><div>À: ${to.map(recipient => recipient.displayName).join(', ')}</div><br>${body}`;
}
