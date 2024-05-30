import { ViewStyle } from 'react-native';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { AudienceReactionType, AudienceReferer } from '~/framework/modules/core/audience/types';

export interface AudienceProps {
  referer: AudienceReferer;
  session: AuthActiveAccount;
  nbComments?: number;
  nbViews?: number;
  infosReactions?: {
    total: number;
    types: AudienceReactionType[];
    userReaction?: AudienceReactionType;
  };
  containerStyle?: ViewStyle;
  actionViews?: () => void;
  actionReactions?: () => void;
}
