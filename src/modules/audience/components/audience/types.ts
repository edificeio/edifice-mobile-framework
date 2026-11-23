import type { StyleProp, ViewStyle } from 'react-native';

import type { AudienceReferer } from '~/modules/audience/model';
import type { AuthActiveAccount } from '~/modules/auth/model';

export interface AudienceProps {
  containerStyle?: StyleProp<ViewStyle>;
  /** Reactions to the resource as the module that shows it loaded them. The bar reloads them after each reaction. */
  infosReactions?: {
    total: number;
    types: string[];
    userReaction?: string;
  };
  isManager?: boolean;
  nbComments?: number;
  nbViews?: number;
  preview?: boolean;
  referer: AudienceReferer;
  session: AuthActiveAccount;
  showComments?: boolean;
}
