/**
 * Actions of `audience`: plain async functions (the module has no Redux store). They call the service and give types of the model.
 * Calls are signed with the session of the app (see `service/index.ts`): no session to give.
 */
// ToDo(audience-migration): a rule of `blog` (its addresses). The consumer should give the referer.
import { blogUriCaptureFunction } from '~/framework/modules/blog/service/resource-uri';
import type { AudienceParameter, AudienceReferer, AudienceResourceReactions } from '~/modules/audience/model';
import { audienceService } from '~/modules/audience/service';
import { usePlatformReactionTypesStore } from '~/modules/audience/store';
import type { AuthActiveAccount } from '~/modules/auth/model';

export const computeAudienceRefererFromResourceUri = (uri: string): AudienceReferer | undefined => {
  // This time, only for blog
  const ret = blogUriCaptureFunction(uri);
  if (ret && ret.postId) {
    return {
      module: 'blog',
      resourceId: ret.postId,
      resourceType: 'post',
    };
  }
};

/** Counts a view of the resource, given by its referer or its URI. A failure is only logged (see `audienceService.view.post`). */
export function markViewAudience(referer: AudienceParameter) {
  const realReferer = referer
    ? typeof referer === 'string'
      ? computeAudienceRefererFromResourceUri(referer)
      : referer
    : undefined;
  if (realReferer) return audienceService.view.post(realReferer.module, realReferer.resourceType, realReferer.resourceId);
}

/** Loads the valid reaction types of the platform of the session into the store. */
export const loadPlatformReactionTypes = async (session: AuthActiveAccount) => {
  const types = await audienceService.reaction.getValidReactionTypes();
  usePlatformReactionTypesStore.getState().setReactionTypes(session.platform.name, types);
};

/** Reactions to the resource, in short. `undefined` if the server knows none. */
export const loadResourceReactions = async (referer: AudienceReferer): Promise<AudienceResourceReactions | undefined> => {
  const summary = await audienceService.reaction.getSummary(referer.module, referer.resourceType, [referer.resourceId]);
  return summary.reactionsByResource[referer.resourceId];
};

/** Removes the reaction of the user to the resource. Gives the reactions to the resource, reloaded. */
export const deleteReaction = async (referer: AudienceReferer) => {
  await audienceService.reaction.delete(referer);
  return loadResourceReactions(referer);
};

/** Reacts to the resource (`POST`). Gives the reactions to the resource, reloaded. */
export const postReaction = async (referer: AudienceReferer, reaction: string) => {
  await audienceService.reaction.post(referer, reaction);
  return loadResourceReactions(referer);
};

/** Changes the reaction of the user to the resource (`PUT`). Gives the reactions to the resource, reloaded. */
export const updateReaction = async (referer: AudienceReferer, reaction: string) => {
  await audienceService.reaction.update(referer, reaction);
  return loadResourceReactions(referer);
};

/** A page of the reactions to the resource (pages start at 1). */
export const loadReactionsPage = (referer: AudienceReferer, page: number, size: number) =>
  audienceService.reaction.getDetails(referer, page, size);

/** The views of the resource. */
export const loadViews = (referer: AudienceReferer) => audienceService.view.getDetails(referer);
