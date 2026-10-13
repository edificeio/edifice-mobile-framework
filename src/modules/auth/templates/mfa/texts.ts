import { I18n } from '~/util/i18n';

import { CodeState, type MFATestIds, type PageTexts } from './types';

/** Texts of the screen where the code received by email is typed. */
export const getEmailMFATexts = (email: string): PageTexts => ({
  feedback: {
    [CodeState.CODE_CORRECT]: I18n.get('auth-mfa-email-feedback-codecorrect'),
    [CodeState.CODE_EXPIRED]: I18n.get('auth-mfa-email-feedback-codeexpired'),
    [CodeState.CODE_WRONG]: I18n.get('auth-mfa-email-feedback-codewrong'),
  },
  message: I18n.get('auth-mfa-email-message'),
  messageSent: `${I18n.get('auth-mfa-email-message-sent')} ${email}.`,
  resendToast: I18n.get('auth-mfa-email-toast'),
  title: I18n.get('auth-mfa-email-title'),
});

/** Texts of the screen where the code received by SMS is typed. */
export const getMobileMFATexts = (mobile: string): PageTexts => ({
  feedback: {
    [CodeState.CODE_CORRECT]: I18n.get('auth-mfa-mobile-feedback-codecorrect'),
    [CodeState.CODE_EXPIRED]: I18n.get('auth-mfa-mobile-feedback-codeexpired'),
    [CodeState.CODE_WRONG]: I18n.get('auth-mfa-mobile-feedback-codewrong'),
  },
  message: I18n.get('auth-mfa-mobile-message'),
  messageSent: `${I18n.get('auth-mfa-mobile-message-sent')} ${mobile}.`,
  resendToast: I18n.get('auth-mfa-mobile-toast'),
  title: I18n.get('auth-mfa-mobile-title'),
});

/**
 * Texts of the screen where the code that confirms the identity of the user (MFA) is typed.
 * @param mobile the mobile the code was sent to (the one of the account)
 */
export const getAccountMFATexts = (mobile?: string): PageTexts => ({
  feedback: {
    [CodeState.CODE_CORRECT]: I18n.get('auth-mfa-feedback-codecorrect'),
    [CodeState.CODE_EXPIRED]: I18n.get('auth-mfa-feedback-codeexpired'),
    [CodeState.CODE_WRONG]: I18n.get('auth-mfa-feedback-codewrong'),
  },
  message: I18n.get('auth-mfa-message'),
  messageSent: `${I18n.get('auth-mfa-message-sent')} ${mobile}.`,
  resendToast: I18n.get('auth-mfa-toast'),
  title: I18n.get('auth-mfa-title'),
});

export const emailMFATestIds: MFATestIds = {
  code: 'email-code',
  codeError: 'email-code-error',
  codeIssues: 'email-code-issues',
  resend: 'email-code-send-again',
  subtitle: 'email-code-subtitle',
  title: 'email-code-title',
};

export const mobileMFATestIds: MFATestIds = {
  code: 'phone-code',
  codeError: 'phone-code-error',
  codeIssues: 'phone-code-issues',
  resend: 'phone-code-send-again',
  subtitle: 'phone-code-subtitle',
  title: 'phone-code-title',
};

export const accountMFATestIds: MFATestIds = {
  code: '',
  codeError: '',
  codeIssues: '',
  resend: '',
  subtitle: '',
  title: '',
};
