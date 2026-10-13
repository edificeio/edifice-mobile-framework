import { I18n } from '~/util/i18n';

import type { PageTexts } from './types';

/** Texts to verify an email the platform asks for (requirement). */
export const getVerifyEmailTexts = (): PageTexts => ({
  button: I18n.get('auth-change-email-verify-button'),
  label: I18n.get('auth-change-email-verify-label'),
  message: I18n.get('auth-change-email-verify-message'),
  title: I18n.get('auth-change-email-verify-title'),
});

/** Texts to modify the email from the user profile. */
export const getEditEmailTexts = (): PageTexts => ({
  button: I18n.get('auth-change-email-verify-button'),
  label: I18n.get('auth-change-email-edit-label'),
  message: I18n.get('auth-change-email-edit-message'),
  title: I18n.get('auth-change-email-edit-title'),
});
