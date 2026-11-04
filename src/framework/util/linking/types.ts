import type { AlertOptions } from 'react-native';

/** What the confirmation alert says. Each text has a default. */
export interface OpenUrlConfirmation {
  title?: string;
  message?: string;
  cancel?: string;
  continue?: string;
  options?: AlertOptions;
}

export interface OpenUrlAsyncOptions {
  /** The texts of the confirmation alert, or `false` to open the url without asking. */
  confirmation?: OpenUrlConfirmation | false;
}

export interface OpenUrlOptions extends OpenUrlAsyncOptions {
  /** The url is open. */
  onSuccess?: () => void;
  /** The user refused to open the url. */
  onCancel?: () => void;
  /** The url could not be open (the error toast is already shown). */
  onError?: (error: unknown) => void;
  /** The text of the error toast. */
  errorText?: string;
}
