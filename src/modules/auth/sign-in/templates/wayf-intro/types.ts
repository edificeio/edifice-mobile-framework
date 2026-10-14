import type { Platform } from '~/framework/util/appConf';
import type { Error } from '~/framework/util/error';

export interface SignInWayfIntroScreenTemplateProps {
  platform: Platform['name'];
  error?: Error.WithKey;
  consumeError: (errorKey: number) => void;
  onContinue: () => void;
}
