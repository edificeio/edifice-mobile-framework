export enum EmailState {
  /** The email the user gave is already the verified one (`onSubmit` tells it). */
  EMAIL_ALREADY_VERIFIED = 'emailAlreadyVerified',
  EMAIL_FORMAT_INVALID = 'emailFormatInvalid',
  PRISTINE = 'pristine',
}

export interface PageTexts {
  button: string;
  label: string;
  message: string;
  title: string;
}

/**
 * The user gives an email address, and a code is sent to it to verify it.
 *
 * The template does not know why: the caller decides what the texts are and what happens next. It is used to:
 * - fulfill the requirement "verify your email" (`requirements/screens/verify-email.tsx`): `texts={getVerifyEmailTexts()}`, `onRefuse` to log out,
 *   `onSubmit` requests the code then goes to the screen where the code is typed;
 * - modify the email from the user profile: `texts={getEditEmailTexts()}`, no `onRefuse`, `confirmLeaveWhenEdited`;
 *   `onSubmit` requests the code and goes to the code screen (`MFAScreenTemplate`, kind `email`),
 *   or returns `EmailState.EMAIL_ALREADY_VERIFIED` if the given email is already the verified one.
 */
export interface VerifyEmailScreenTemplateProps {
  /** Email the field starts with (the one the platform knows, if any). */
  defaultEmail?: string;
  /** Texts of the screen. Always given by the caller: see `texts.ts` for the available ones (`getVerifyEmailTexts`, `getEditEmailTexts`). */
  texts: PageTexts;
  /**
   * Asks the user for confirmation before leaving the screen while an email was typed.
   * Defaults to `false`.
   */
  confirmLeaveWhenEdited?: boolean;
  /**
   * The user refuses to verify its email (e.g. to log out). If it throws, an error toast is shown.
   * The "refuse" button is only shown if this is given.
   */
  onRefuse?: () => Promise<unknown>;
  /**
   * The user wants a validation code to be sent to this email (already checked as a valid email). Throws if it fails (an error toast is shown).
   * Return `EmailState.EMAIL_ALREADY_VERIFIED` to tell that this email is the verified one already: the error is displayed in the screen.
   */
  onSubmit: (email: string) => Promise<EmailState.EMAIL_ALREADY_VERIFIED | void>;
}
