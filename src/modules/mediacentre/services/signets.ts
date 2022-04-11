import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { resourcesAdapter } from '~/modules/mediacentre/services/textbooks';

export const signetsService = {
  get: async () => {
    const resources = await fetchJSONWithCache(`/mediacentre/signets`, {
      method: 'get',
    });
    return resourcesAdapter(resources.data.signets.resources).filter(resource => resource.types.includes('Signet'));
  },
  getOrientation: async () => {
    const resources = await fetchJSONWithCache(`/mediacentre/signets`, {
      method: 'get',
    });
    return resourcesAdapter(resources.data.signets.resources).filter(resource => resource.types.includes('Orientation'));
  },
};
