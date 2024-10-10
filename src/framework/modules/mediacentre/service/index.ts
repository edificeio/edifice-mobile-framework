import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { Resource, Source } from '~/framework/modules/mediacentre/model';
import { fetchJSONWithCache, signedFetch } from '~/infra/fetchWithCache';

const mainStructureIds = [
  '80231ab1-bed5-427d-ba36-f1929b2d6a7e',
  '3201efe3-9d35-43b5-b858-9a0f73356f8d',
  '045402fd-0f7b-4e25-9f18-17544c74c238',
  '0b2c3691-71be-46c8-b28d-14f1daec46ed',
  '319622be-f4de-4e66-b7b8-1aa2f5262e66',
];

type BackendResource = {
  id: string | number;
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
  disciplines?: string[] | [number, string][];
  levels: string[] | [number, string][];
  user: string;
  favorite?: boolean;
  structure_uai?: string;
  orientation?: boolean;
  owner_id?: string;
  owner_name?: string;
  pinned_title?: string;
  pinned_description?: string;
  structure_owner?: string;
};

type BackendSearch = {
  event: string;
  state: string;
  status: string;
  data: {
    source: Source;
    resources: BackendResource[];
  };
}[];

const transformArray = (array: string[] | [number, string][]): string[] =>
  array.map((value: string | [number, string]) => (Array.isArray(value) ? value[1] : value));

const resourceAdapter = (data: BackendResource): Resource => {
  const id = (data._id ?? typeof data.id === 'number') ? data.id.toString() : data.id;
  return {
    authors: data.owner_name ?? data.authors,
    disciplines: data.disciplines ? transformArray(data.disciplines) : [],
    editors: data.editors,
    highlightPin: data.structure_owner ? mainStructureIds.includes(data.structure_owner) : false,
    id,
    image: data.image,
    levels: transformArray(data.levels),
    link: (data.link ?? data.url) as string,
    pinnedDescription: data.pinned_description,
    source: data.source ?? Source.SIGNET,
    title: data.pinned_title ?? data.title,
    types: data.document_types ?? ['livre numérique'],
    uid: data.structure_uai ? data.id + data.structure_uai : id,
  };
};

export const mediacentreService = {
  favorites: {
    get: async (session: AuthActiveAccount) => {
      const api = '/mediacentre/favorites';
      const { data: favorites } = (await fetchJSONWithCache(api)) as { data: BackendResource[] };
      if (!Array.isArray(favorites)) return [];
      return favorites.map(resourceAdapter);
    },
    add: async (session: AuthActiveAccount, resource: Resource) => {
      const api = `/mediacentre/favorites?id=${resource.id}`;
      return signedFetch(`${session.platform.url}${api}`, {
        method: 'POST',
        body: JSON.stringify(resource),
      }) as Promise<any>;
    },
    remove: async (session: AuthActiveAccount, id: string, source: Source) => {
      const api = `/mediacentre/favorites?id=${id}&source=${source}`;
      return signedFetch(`${session.platform.url}${api}`, {
        method: 'DELETE',
      }) as Promise<any>;
    },
  },
  globalResources: {
    get: async (session: AuthActiveAccount) => {
      const api = '/mediacentre/global/resources';
      const response = (await fetchJSONWithCache(api)) as BackendSearch;
      if (response[0]?.status !== 'ok') return [];
      return response.flatMap(s => [...s.data.resources]).map(resourceAdapter);
    },
  },
  pins: {
    get: async (session: AuthActiveAccount, structureId: string) => {
      const api = `/mediacentre/structures/${structureId}/pins`;
      const resources = (await fetchJSONWithCache(api)) as BackendResource[];
      return resources.map(resourceAdapter);
    },
  },
  search: {
    getSimple: async (session: AuthActiveAccount, sources: Source[], query: string) => {
      const jsondata = {
        event: 'search',
        state: 'PLAIN_TEXT',
        sources,
        data: {
          query,
        },
      };
      const api = `/mediacentre/search?jsondata=${JSON.stringify(jsondata)}`;
      const response = (await fetchJSONWithCache(api)) as BackendSearch;
      if (response[0]?.status !== 'ok') return [];
      return response.flatMap(s => [...s.data.resources]).map(resourceAdapter);
    },
  },
  selectedStructure: {
    get: async (session: AuthActiveAccount) => {
      const api = `/userbook/preference/selectedStructure`;
      const { preference } = (await fetchJSONWithCache(api)) as { preference?: string };
      if (!preference) return null;
      return preference.replaceAll('"', '');
    },
    update: async (session: AuthActiveAccount, id: string) => {
      const api = `/userbook/preference/selectedStructure`;
      return signedFetch(`${session.platform.url}${api}`, {
        method: 'PUT',
        body: JSON.stringify(id),
      }) as Promise<any>;
    },
  },
  signets: {
    get: async (session: AuthActiveAccount) => {
      const response = (await fetchJSONWithCache('/mediacentre/signets')) as {
        data: {
          signets: {
            resources: BackendResource[];
          };
        };
      };
      const signets = response.data.signets.resources;
      const mysignets = (await fetchJSONWithCache('/mediacentre/mysignets')) as BackendResource[];
      return signets.concat(mysignets.filter(ms => !signets.some(s => s.id === ms.id.toString()))).map(resourceAdapter);
    },
  },
  textbooks: {
    get: async (session: AuthActiveAccount, structureId: string) => {
      const api = `/mediacentre/textbooks/refresh?structureIds=${structureId}`;
      const response = (await fetchJSONWithCache(api)) as {
        data: {
          textbooks: BackendResource[];
        };
      };
      return response.data.textbooks.map(resourceAdapter);
    },
  },
};
