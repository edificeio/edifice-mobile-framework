import type { AudienceReferer } from '~/modules/audience/model';

import type { API } from './types';

/** Body of a reaction to a resource (`POST` or `PUT`). */
export const toReactionBody = (referer: AudienceReferer, reaction: string): API.ReactionBody => ({
  reactionType: reaction,
  resourceId: referer.resourceId,
});

/** Valid reaction types of the platform, from its public conf. */
export const toReactionTypes = (response: API.ConfResponse): string[] => response['reaction-types'];
