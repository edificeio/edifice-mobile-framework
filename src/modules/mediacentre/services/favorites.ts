import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { resourcesAdapter } from '~/modules/mediacentre/services/textbooks';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';

export const favoritesService = {
  get: async () => {
    const reponse = await fetchJSONWithCache(`/mediacentre/favorites`);
    let favorites = resourcesAdapter(reponse.data);
    favorites.forEach(resource => resource.favorite = true);
    return (favorites);
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
