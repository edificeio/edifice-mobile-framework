import { I18n } from '~/util/i18n';

import type { PageTexts } from './types';

/** Texts to verify a mobile the platform asks for (requirement). */
export const getVerifyMobileTexts = (): PageTexts => ({
  button: I18n.get('auth-change-mobile-verify-button'),
  label: I18n.get('auth-change-mobile-verify-label'),
  message: I18n.get('auth-change-mobile-verify-message'),
  title: I18n.get('auth-change-mobile-verify-title'),
});

/**
 * Texts to modify the mobile from the user profile.
 * @param needsVerification whether the platform verifies the mobile with a code (then the user is asked to verify it)
 * or just saves it.
 */
export const getEditMobileTexts = (needsVerification: boolean): PageTexts => ({
  button: needsVerification ? I18n.get('auth-change-mobile-verify-button') : I18n.get('auth-change-mobile-edit-button'),
  label: I18n.get('auth-change-mobile-edit-label'),
  message: needsVerification ? I18n.get('auth-change-mobile-edit-message') : I18n.get('auth-change-mobile-edit-message-unverified'),
  title: I18n.get('auth-change-mobile-edit-title'),
});
