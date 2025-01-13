import { I18n } from '~/app/i18n';
import { MailsRecipients, MailsRecipientsType } from './model';

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
