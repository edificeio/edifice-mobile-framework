/**
 * API of `audience`. It takes and gives types of the model (see `adapter.ts`).
 * Every call is signed with the session of the app (`sessionFetch`): old modules call it without a session at hand (fiche, §6, 6).
 */
import { getModuleTransport } from '~/framework/util/transport';
import type {
  AudienceReactions,
  AudienceReferer,
  AudienceSummaryReactions,
  AudienceSummaryViews,
  AudienceViews,
} from '~/modules/audience/model';

import { toReactionBody, toReactionTypes } from './adapter';
import type { API } from './types';

// Typed with the scopes of the module (`getModuleTransport`): `/audience/...`
const { sessionFetch } = getModuleTransport('audience');

export const audienceService = {
  reaction: {
    delete: async (referer: AudienceReferer) =>
      sessionFetch(`/audience/reactions/${referer.module}/${referer.resourceType}/${referer.resourceId}`, { method: 'DELETE' }),
    getDetails: async (referer: AudienceReferer, page: number, size: number): Promise<AudienceReactions> =>
      sessionFetch.json<API.ReactionsResponse>(
        `/audience/reactions/${referer.module}/${referer.resourceType}/${referer.resourceId}?page=${page}&size=${size}`,
      ),
    getSummary: async (module: string, resourceType: string, resourceIds: string[]): Promise<AudienceSummaryReactions> =>
      sessionFetch.json<API.ReactionsSummaryResponse>(
        `/audience/reactions/${module}/${resourceType}?resourceIds=${resourceIds.join(',')}`,
      ),
    getValidReactionTypes: async () => toReactionTypes(await sessionFetch.json<API.ConfResponse>('/audience/conf/public')),
    post: async (referer: AudienceReferer, reaction: string) =>
      sessionFetch(`/audience/reactions/${referer.module}/${referer.resourceType}`, {
        body: JSON.stringify(toReactionBody(referer, reaction)),
        method: 'POST',
      }),
    update: async (referer: AudienceReferer, reaction: string) =>
      sessionFetch(`/audience/reactions/${referer.module}/${referer.resourceType}`, {
        body: JSON.stringify(toReactionBody(referer, reaction)),
        method: 'PUT',
      }),
  },
  view: {
    getDetails: async (referer: AudienceReferer): Promise<AudienceViews> =>
      sessionFetch.json<API.ViewsResponse>(
        `/audience/views/details/${referer.module}/${referer.resourceType}/${referer.resourceId}`,
      ),
    getSummary: async (module: string, resourceType: string, resourceIds: string[]): Promise<AudienceSummaryViews> =>
      sessionFetch.json<API.ViewsSummaryResponse>(
        `/audience/views/count/${module}/${resourceType}?resourceIds=${resourceIds.join(',')}`,
      ),
    /** Counts a view of the resource. A failure is only logged: counting a view must never disturb the user. */
    post: async (module: string, resourceType: string, resourceId: string) => {
      try {
        return await sessionFetch(`/audience/views/${module}/${resourceType}/${resourceId}`, { method: 'POST' });
      } catch (e) {
        console.error('[Audience] failed to request', e);
      }
    },
  },
};
