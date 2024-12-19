import {
  AudienceReactions,
  AudienceReferer,
  AudienceSummaryReactions,
  AudienceSummaryViews,
  AudienceValidReactionTypes,
  AudienceViews,
} from './types';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { fetchJSONWithCache, signedFetch, signedFetchRelative } from '~/infra/fetchWithCache';

export const audienceService = {
  reaction: {
    delete: async (session: AuthActiveAccount, referer: AudienceReferer) => {
      const api = `/audience/reactions/${referer.module}/${referer.resourceType}/${referer.resourceId}`;
      return signedFetch(`${session.platform.url}${api}`, {
        method: 'DELETE',
      }) as Promise<Response>;
    },
    getDetails: async (referer: AudienceReferer, page: number, size: number) => {
      const api = `/audience/reactions/${referer.module}/${referer.resourceType}/${referer.resourceId}?page=${page}&size=${size}`;
      const entcoreAudienceReactions = await fetchJSONWithCache(api);
      return entcoreAudienceReactions as AudienceReactions;
    },
    getSummary: async (module: string, resourceType: string, resourceIds: string[]) => {
      const api = `/audience/reactions/${module}/${resourceType}?resourceIds=${resourceIds.join(',')}`;
      const audienceSummaryReactions = await fetchJSONWithCache(api);
      return audienceSummaryReactions as AudienceSummaryReactions;
    },
    getValidReactionTypes: async () => {
      const api = `/audience/conf/public`;
      const validReactionTypes = await fetchJSONWithCache(api);
      return validReactionTypes as AudienceValidReactionTypes;
    },
    post: async (session: AuthActiveAccount, referer: AudienceReferer, reaction: string) => {
      const api = `/audience/reactions/${referer.module}/${referer.resourceType}`;
      const body = JSON.stringify({
        reactionType: reaction,
        resourceId: referer.resourceId,
      });
      return signedFetch(`${session.platform.url}${api}`, {
        body,
        method: 'POST',
      }) as Promise<any>;
    },
    update: async (session: AuthActiveAccount, referer: AudienceReferer, reaction: string) => {
      const api = `/audience/reactions/${referer.module}/${referer.resourceType}`;
      const body = JSON.stringify({
        reactionType: reaction,
        resourceId: referer.resourceId,
      });
      return signedFetch(`${session.platform.url}${api}`, {
        body,
        method: 'PUT',
      }) as Promise<any>;
    },
  },
  view: {
    getDetails: async (referer: AudienceReferer) => {
      const api = `/audience/views/details/${referer.module}/${referer.resourceType}/${referer.resourceId}`;
      const audienceViews = await fetchJSONWithCache(api);
      return audienceViews as AudienceViews;
    },
    getSummary: async (module: string, resourceType: string, resourceIds: string[]) => {
      const api = `/audience/views/count/${module}/${resourceType}?resourceIds=${resourceIds.join(',')}`;
      const audienceSummaryViews = await fetchJSONWithCache(api);
      return audienceSummaryViews as AudienceSummaryViews;
    },
    post: async (module: string, resourceType: string, resourceId: string) => {
      try {
        return await signedFetchRelative(`/audience/views/${module}/${resourceType}/${resourceId}`, {
          method: 'POST',
        });
      } catch (e) {
        console.error('[Audience] failed to request', e);
      }
    },
  },
};
