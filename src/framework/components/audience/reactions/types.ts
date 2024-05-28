import { AudienceReactionType, AudienceUserReaction } from '~/framework/modules/core/audience/types';

export interface AudienceReactionsModalProps {
  allReactionsCounter: number;
  countByType: Record<AudienceReactionType, number>;
  userReactions: AudienceUserReaction[];
}
