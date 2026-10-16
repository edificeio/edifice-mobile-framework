export enum EmailState {
  EMAIL_FORMAT_INVALID = 'emailFormatInvalid',
  PRISTINE = 'pristine',
}

export interface PageTexts {
  button: string;
  label: string;
  message: string;
  title: string;
}

export interface RequirementVerifyEmailScreenTemplateProps {
  /** Email the field starts with (the one the platform knows, if any). */
  defaultEmail?: string;
  /** The user refuses to verify its email (and logs out). */
  onRefuse: () => Promise<unknown>;
  /** The user wants a validation code to be sent to this email (already checked as a valid email). Throws if it fails. */
  onSubmit: (email: string) => Promise<void>;
}
