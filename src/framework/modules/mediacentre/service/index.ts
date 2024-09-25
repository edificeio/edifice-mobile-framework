import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { Resource, Source } from '~/framework/modules/mediacentre/model';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

type BackendResource = {
  id: string;
  _id?: string;
  title: string;
  plain_text: string;
  image: string;
  document_types?: string[];
  source?: Source;
  link?: string;
  url?: string;
  authors: string[];
  editors: string[];
  disciplines: string[];
  levels: string[];
  user: string;
  favorite?: boolean;
  structure_uai?: string;
  orientation?: boolean;
  owner_id?: string;
  owner_name?: string;
};

export function compareResources(a: Resource, b: Resource) {
  return a.title.localeCompare(b.title);
}

function transformArray(array: string[]) {
  array = array.map(value => (Array.isArray(value) && value.length > 1 ? value[1] : value));
  return array;
}

const resourcesAdapter: (data: BackendResource[]) => Resource[] = data => {
  const resources = [] as Resource[];
  for (const resource of data) {
    const id = resource.source === Source.SIGNET ? resource.id : resource._id ?? resource.id;
    const res = {
      id,
      uid: resource.structure_uai ? resource.id + resource.structure_uai : id,
      title: resource.title,
      plain_text: resource.plain_text,
      image: resource.image,
      types: resource.document_types || ['livre numérique'],
      source: resource.source || Source.SIGNET,
      link: resource.link || resource.url,
      authors: resource.owner_name || resource.authors,
      editors: resource.editors,
      disciplines: resource.disciplines,
      levels: transformArray(resource.levels),
      user: resource.user,
      favorite: resource.favorite,
      structure_uai: resource.structure_uai,
      orientation: resource.orientation,
      owner_id: resource.owner_id,
    } as Resource;
    resources.push(res);
  }
  return resources.sort(compareResources);
};

const concatResources = (response: any) => {
  let resources: any[] = [];
  for (const res of response) {
    if (res.data && res.data.resources) {
      resources = resources.concat(res.data.resources);
    }
  }
  return resources;
};

export const mediacentreService = {
  favorites: {
    get: async (session: AuthLoggedAccount) => {
      const api = '/mediacentre/favorites';
      const res = await fetchJSONWithCache(api);
      if (!Array.isArray(res.data)) return [];
      const favorites = resourcesAdapter(res.data);
      for (const resource of favorites) {
        resource.favorite = true;
      }
      return favorites;
    },
    add: async (session: AuthLoggedAccount, id: string, resource: Resource) => {
      const api = `/mediacentre/favorites?id=${id}`;
      const res: any = resource;
      if (resource.source === Source.SIGNET) {
        res.id = Number(resource.id);
      }
      await fetchJSONWithCache(api, {
        method: 'POST',
        body: JSON.stringify(res),
      });
    },
    remove: async (session: AuthLoggedAccount, id: string, source: Source) => {
      const api = `/mediacentre/favorites?id=${id}&source=${source}`;
      await fetchJSONWithCache(api, {
        method: 'DELETE',
      });
    },
  },
  search: {
    getSimple: async (session: AuthLoggedAccount, sources: string[], query: string) => {
      const jsondata = {
        event: 'search',
        state: 'PLAIN_TEXT',
        sources,
        data: {
          query,
        },
      };
      const api = `/mediacentre/search?jsondata=${JSON.stringify(jsondata)}`;
      const response = await fetchJSONWithCache(api);
      return resourcesAdapter(concatResources(response));
    },
  },
  signets: {
    get: async (session: AuthLoggedAccount) => {
      const signetsResponse = await fetchJSONWithCache('/mediacentre/signets');
      const mysignetsResponse = await fetchJSONWithCache('/mediacentre/mysignets');
      return resourcesAdapter(signetsResponse.data.signets.resources)
        .concat(resourcesAdapter(mysignetsResponse).filter(resource => session.user.id && resource.owner_id !== session.user.id))
        .sort(compareResources);
    },
    getOrientation: async (session: AuthLoggedAccount) => {
      const signetsResponse = await fetchJSONWithCache('/mediacentre/signets');
      const mysignetsResponse = await fetchJSONWithCache('/mediacentre/mysignets');
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
    searchSimple: async (session: AuthLoggedAccount, query: string) => {
      const api = `/mediacentre/signets/search?query=${query}`;
      const resources = await fetchJSONWithCache(api);
      return resourcesAdapter(resources);
    },
  },
  textbooks: {
    get: async (session: AuthLoggedAccount) => {
      const api = '/mediacentre/textbooks';
      const res = await fetchJSONWithCache(api);
      return resourcesAdapter(res.data.textbooks);
    },
  },
};
