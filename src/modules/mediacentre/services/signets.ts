import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { compareResources, resourcesAdapter } from '~/modules/mediacentre/services/textbooks';

export const signetsService = {
  get: async (userId: string) => {
    const signetsResponse = await fetchJSONWithCache(`/mediacentre/signets`, {
      method: 'get',
    });
    const mysignetsResponse = await fetchJSONWithCache(`/mediacentre/mysignets`, {
      method: 'get',
    });
    return resourcesAdapter(signetsResponse.data.signets.resources)
      .filter(resource => resource.types.includes('Signet'))
      .concat(resourcesAdapter(mysignetsResponse).filter(resource => userId && resource.owner_id !== userId))
      .sort(compareResources);
  },
  getOrientation: async () => {
    const signetsResponse = await fetchJSONWithCache(`/mediacentre/signets`, {
      method: 'get',
    });
    const mysignetsResponse = await fetchJSONWithCache(`/mediacentre/mysignets`, {
      method: 'get',
    });
    const resources = resourcesAdapter(signetsResponse.data.signets.resources).filter(resource =>
      resource.types.includes('Orientation'),
    );
    for (const res of resourcesAdapter(mysignetsResponse)) {
      if (res.orientation === true && resources.findIndex(resource => resource.id === String(res.id)) === -1) {
        resources.push(res);
      }
    }
    return resources.sort(compareResources);
  },
};
