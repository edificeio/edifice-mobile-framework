import type {
  IEntcoreEmailValidationState,
  IEntcoreMFAValidationState,
  IEntcoreMobileValidationState,
} from '../../../service/types';

export type MFAKind = 'email' | 'mobile' | 'mfa';

export interface RequirementMFAScreenTemplateProps {
  /** What is verified: changes the texts, the testIDs and the feedbacks. */
  kind: MFAKind;
  /** The email or the mobile the code was sent to. */
  target?: string;
  /** Called after the code was found correct (once the feedback was shown). If it throws, an error toast is shown. */
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
  feedback: string;
  message: string;
  messageSent: string;
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
