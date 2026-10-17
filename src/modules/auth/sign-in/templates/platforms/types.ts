import { Platform } from '~/framework/util/appConf';

export interface AuthPlatformsScreenProps {
  onOpenItem?: (platform: Platform) => void;
  showWelcome?: boolean;
}
