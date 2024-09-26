import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { Resource, Source } from '~/framework/modules/mediacentre/model';
import { fetchJSONWithCache, signedFetch } from '~/infra/fetchWithCache';

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

const resourceAdapter = (data: BackendResource): Resource => {
  const id = data.source === Source.SIGNET ? data.id : data._id ?? data.id;
  return {
    authors: data.owner_name ?? data.authors,
    editors: data.editors,
    id,
    image: data.image,
    levels: transformArray(data.levels),
    link: (data.link ?? data.url) as string,
    source: data.source ?? Source.SIGNET,
    title: data.title,
    types: data.document_types ?? ['livre numérique'],
    uid: data.structure_uai ? data.id + data.structure_uai : id,
  };
};

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
      const { data: favorites } = (await fetchJSONWithCache(api)) as { data: BackendResource[] };
      if (!Array.isArray(favorites)) return [];
      return favorites.map(resourceAdapter);
    },
    add: async (session: AuthLoggedAccount, resource: Resource) => {
      const api = `/mediacentre/favorites?id=${resource.id}`;
      return signedFetch(`${session.platform.url}${api}`, {
        method: 'POST',
        body: JSON.stringify(resource),
      }) as Promise<any>;
    },
    remove: async (session: AuthLoggedAccount, id: string, source: Source) => {
      const api = `/mediacentre/favorites?id=${id}&source=${source}`;
      return signedFetch(`${session.platform.url}${api}`, {
        method: 'DELETE',
      }) as Promise<any>;
    },
  },
  search: {
    getSimple: async (session: AuthLoggedAccount, sources: Source[], query: string) => {
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
        .concat(resourcesAdapter(mysignetsResponse))
        .sort(compareResources);
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
