import { signedFetchRelative } from '~/infra/fetchWithCache';

export default {
  post: async (module: string, resourceType: string, resourceId: string) => {
    try {
      return await signedFetchRelative(`/audience/views/${module}/${resourceType}/${resourceId}`, {
        method: 'POST',
      });
    } catch (e) {
      console.error('[Audience] failed to request', e);
    }
  },
};
