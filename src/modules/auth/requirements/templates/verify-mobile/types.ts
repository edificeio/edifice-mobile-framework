export interface RequirementVerifyMobileScreenTemplateProps {
  /** Mobile number the platform already knows, to prefill the input. */
  defaultMobile?: string;
  /** The user gives a mobile number to verify (valid and formatted). Throws if it fails (an error toast is shown). */
  onSubmit: (mobile: string) => Promise<void>;
  /** The user refuses to verify its mobile. If it throws, an error toast is shown. */
  onRefuse: () => Promise<unknown>;
}

export type MobileState = 'MOBILE_FORMAT_INVALID' | 'PRISTINE' | 'STALE';

export interface PageTexts {
  button: string;
  label: string;
  message: string;
  title: string;
}
