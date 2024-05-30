import { AudienceReactionType } from '~/framework/modules/core/audience/types';

export interface AudienceReactButtonProps {
  userReaction: AudienceReactionType | null;
  deleteReaction: () => void;
  postReaction: (reaction: AudienceReactionType) => void;
  updateReaction: (reaction: AudienceReactionType) => void;
}
