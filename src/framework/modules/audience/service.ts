import {
  AudienceReactions,
  AudienceReferer,
  AudienceSummaryReactions,
  AudienceSummaryViews,
  AudienceValidReactionTypes,
  AudienceViews,
} from './types';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { sessionFetch } from '~/framework/util/transport';

export const audienceService = {
  reaction: {
    delete: async (session: AuthActiveAccount, referer: AudienceReferer) => {
      const api = `/audience/reactions/${referer.module}/${referer.resourceType}/${referer.resourceId}`;

      return sessionFetch(api, { method: 'DELETE' });
    },
    getDetails: async (referer: AudienceReferer, page: number, size: number) => {
      const api = `/audience/reactions/${referer.module}/${referer.resourceType}/${referer.resourceId}?page=${page}&size=${size}`;

      return await sessionFetch.json<AudienceReactions>(api);
    },

    getSummary: async (module: string, resourceType: string, resourceIds: string[]) => {
      const api = `/audience/reactions/${module}/${resourceType}?resourceIds=${resourceIds.join(',')}`;

      return await sessionFetch.json<AudienceSummaryReactions>(api);
    },
    getValidReactionTypes: async () => {
      const api = `/audience/conf/public`;

      return await sessionFetch.json<AudienceValidReactionTypes>(api);
    },
    post: async (session: AuthActiveAccount, referer: AudienceReferer, reaction: string) => {
      const api = `/audience/reactions/${referer.module}/${referer.resourceType}`;
      const body = JSON.stringify({
        reactionType: reaction,
        resourceId: referer.resourceId,
      });

      return sessionFetch(api, { body, method: 'POST' });
    },
    update: async (session: AuthActiveAccount, referer: AudienceReferer, reaction: string) => {
      const api = `/audience/reactions/${referer.module}/${referer.resourceType}`;
      const body = JSON.stringify({
        reactionType: reaction,
        resourceId: referer.resourceId,
      });

      return sessionFetch(api, { body, method: 'PUT' });
    },
  },
  view: {
    getDetails: async (referer: AudienceReferer) => {
      const api = `/audience/views/details/${referer.module}/${referer.resourceType}/${referer.resourceId}`;

      return await sessionFetch.json<AudienceViews>(api);
    },
    getSummary: async (module: string, resourceType: string, resourceIds: string[]) => {
      const api = `/audience/views/count/${module}/${resourceType}?resourceIds=${resourceIds.join(',')}`;

      return await sessionFetch.json<AudienceSummaryViews>(api);
    },
    post: async (module: string, resourceType: string, resourceId: string) => {
      try {
        return await sessionFetch(`/audience/views/${module}/${resourceType}/${resourceId}`, {
          method: 'POST',
        });
      } catch (e) {
        console.error('[Audience] failed to request', e);
      }
    },
  },
};
