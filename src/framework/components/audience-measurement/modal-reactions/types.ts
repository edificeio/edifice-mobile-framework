import { AudienceReactionType, AudienceUserReaction } from '~/framework/modules/core/audience/types';

export interface AudienceMeasurementReactionsModalProps {
  allReactionsCounter: number;
  countByType: Record<AudienceReactionType, number>;
  userReactions: AudienceUserReaction[];
}
