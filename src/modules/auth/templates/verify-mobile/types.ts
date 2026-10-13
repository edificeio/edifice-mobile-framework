export type MobileState = 'MOBILE_FORMAT_INVALID' | 'PRISTINE' | 'STALE';

export interface PageTexts {
  button: string;
  label: string;
  message: string;
  title: string;
}

/**
 * The user gives a mobile number, to verify it with a code sent by SMS (or to save it).
 *
 * The template does not know why: the caller decides what the texts are and what happens next. It is used to:
 * - fulfill the requirement "verify your mobile" (`requirements/screens/verify-mobile.tsx`): `texts={getVerifyMobileTexts()}`, `onRefuse` to log out,
 *   `onSubmit` requests the code then goes to the screen where the code is typed;
 * - modify the mobile from the user profile: `texts={getEditMobileTexts(needsVerification)}`, no `onRefuse`,
 *   `confirmLeaveWhenEdited`; `onSubmit` either requests the code and goes to the code screen (`MFAScreenTemplate`, kind `mobile`)
 *   when the platform verifies mobiles (`needsVerification`), or saves the mobile directly.
 */
export interface VerifyMobileScreenTemplateProps {
  /** Mobile number the platform already knows, to prefill the input. */
  defaultMobile?: string;
  /** Texts of the screen. Always given by the caller: see `texts.ts` for the available ones (`getVerifyMobileTexts`, `getEditMobileTexts`). */
  texts: PageTexts;
  /**
   * Asks the user for confirmation before leaving the screen while a mobile was typed.
   * Defaults to `false`.
   */
  confirmLeaveWhenEdited?: boolean;
  /**
   * The user refuses to verify its mobile (e.g. to log out). If it throws, an error toast is shown.
   * The "refuse" button is only shown if this is given.
   */
  onRefuse?: () => Promise<unknown>;
  /** The user gives a mobile number (valid and formatted). Throws if it fails (an error toast is shown). */
  onSubmit: (mobile: string) => Promise<void>;
}
