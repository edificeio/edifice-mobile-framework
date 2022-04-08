import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { resourcesAdapter } from '~/modules/mediacentre/services/textbooks';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';

export const favoritesService = {
  get: async () => {
    const reponse = await fetchJSONWithCache(`/mediacentre/favorites`);
    const favorites = resourcesAdapter(reponse.data);
    for (const resource of favorites) {
      resource.favorite = true;
    }
    return favorites;
  },
  post: async (id: string, resource: Resource) => {
    await fetchJSONWithCache(`/mediacentre/favorites?id=${id}`, {
      method: 'post',
      body: JSON.stringify(resource),
    });
  },
  delete: async (id: string, source: Source) => {
    await fetchJSONWithCache(`/mediacentre/favorites?id=${id}&source=${source}`, {
      method: 'delete',
    });
  },
};
