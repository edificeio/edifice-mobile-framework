import type {
  IEntcoreEmailValidationState,
  IEntcoreMFAValidationState,
  IEntcoreMobileValidationState,
} from '~/modules/auth/service/types';

/**
 * What the code is for. It decides the picture of the screen (an envelope, a phone, or an animated lock) and when `onVerified`
 * is called. The texts and testIDs are given separately.
 */
export type MFAKind = 'email' | 'mobile' | 'mfa';

/**
 * The user types the code it received, to verify an email, a mobile, or its own identity (MFA).
 *
 * The template does not know why: the caller decides what the texts are (`texts.ts` has the usual ones) and what happens
 * once the code is right (`onVerified`). It is used to:
 * - fulfill the requirement "verify your email / mobile" (`requirements/screens/verify-*-code.tsx`):
 *   `onVerified` checks the requirements again;
 * - modify the email / mobile from the user profile (kind `email` / `mobile`): `onVerified` saves the new value
 *   and leaves the screen;
 * - confirm the identity of the user before a sensitive action (kind `mfa`): `onVerified` goes on with that action.
 */
export interface MFAScreenTemplateProps {
  /** What is verified: changes the picture and when `onVerified` is called. */
  kind: MFAKind;
  /** Texts of the screen. Always given by the caller, see `texts.ts` (`getEmailMFATexts`, `getMobileMFATexts`, `getAccountMFATexts`). */
  texts: PageTexts;
  /** testIDs of the screen. Always given by the caller, see `texts.ts` (`emailMFATestIds`, `mobileMFATestIds`, `accountMFATestIds`). */
  testIds: MFATestIds;
  /**
   * Called after the code was found correct, once the feedback was shown: after a short delay for kinds `email` and `mobile`,
   * when the animation ends for kind `mfa`. If it throws, an error toast is shown.
   */
  onVerified: () => Promise<void>;
  /** Asks for a new code. Throws if it fails. */
  onResendCode: () => Promise<void>;
  /** Checks the typed code. */
  onVerifyCode: (
    code: string,
  ) => Promise<IEntcoreEmailValidationState | IEntcoreMobileValidationState | IEntcoreMFAValidationState | undefined>;
}

export enum CodeState {
  CODE_CORRECT = 'codeCorrect',
  CODE_EXPIRED = 'codeExpired',
  CODE_RESENT = 'codeResent',
  CODE_STATE_UNKNOWN = 'codeStateUnknown',
  CODE_WRONG = 'codeWrong',
  PRISTINE = 'pristine',
}

export interface PageTexts {
  /** What is said about the code once it was checked, by result. */
  feedback: Record<CodeState.CODE_CORRECT | CodeState.CODE_EXPIRED | CodeState.CODE_WRONG, string>;
  message: string;
  /** Says where the code was sent (the caller puts the email / mobile in it). */
  messageSent: string;
  /** Toast shown when a new code was sent. */
  resendToast: string;
  title: string;
}

export interface MFATestIds {
  title: string;
  subtitle: string;
  code: string;
  codeError: string;
  codeIssues: string;
  resend: string;
}
