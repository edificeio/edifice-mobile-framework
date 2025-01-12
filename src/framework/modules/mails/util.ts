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
): { text: string; nbRecipients: number } {
  const formatPart = (prefixKey: string, recipients: MailsRecipients): string | null => {
    const names = recipients.users.map(user => user.displayName).join(', ');
    const groups = recipients.groups.map(group => group.displayName).join(', ');
    const combined = [names, groups].filter(Boolean).join(' ');
    return combined ? `${I18n.get(prefixKey)} ${combined}` : null;
  };

  const parts = [formatPart('mails-prefixto', to), formatPart('mails-prefixcc', cc), formatPart('mails-prefixcci', cci)].filter(
    Boolean,
  );

  const nbRecipients =
    to.users.length + to.groups.length + cc.users.length + cc.groups.length + cci.users.length + cci.groups.length;

  return {
    text: parts.length > 0 ? parts.join(' ') : I18n.get('mails-list-norecipient'),
    nbRecipients,
  };
}
