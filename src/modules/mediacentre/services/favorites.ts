import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { resourcesAdapter } from '~/modules/mediacentre/services/textbooks';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';

export const favoritesService = {
  get: async () => {
    const reponse = await fetchJSONWithCache(`/mediacentre/favorites`);
    return resourcesAdapter(reponse.data);
  },
  post: async (id: string, resource: Resource) => {
    const body = {
      resource,
    } as any;
    await fetchJSONWithCache(`/mediacentre/favorites?id=${id}`, {
      method: 'post',
      body: JSON.stringify(body),
    });
  },
  delete: async (id: string, source: Source) => {
    await fetchJSONWithCache(`/mediacentre/favorites?id=${id}&source=${source}`, {
      method: 'delete',
    });
  },
};
