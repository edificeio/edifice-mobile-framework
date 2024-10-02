import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { IField, ISources } from '~/framework/modules/mediacentre/components/AdvancedSearchModal';
import { IResource, IResourceList, Source } from '~/framework/modules/mediacentre/reducer';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

interface IBackendResource {
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
}

type IBackendResourceList = IBackendResource[];

export function compareResources(a: IResource, b: IResource) {
  return a.title.localeCompare(b.title);
}

function transformArray(array: string[]) {
  array = array.map(value => (Array.isArray(value) && value.length > 1 ? value[1] : value));
  return array;
}

const resourcesAdapter: (data: IBackendResourceList) => IResourceList = data => {
  const resources = [] as IResource[];
  for (const resource of data) {
    const id = resource.source === Source.SIGNET ? resource.id : (resource._id ?? resource.id);
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
    } as IResource;
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

const addFieldWhenFilled = (field: IField) => {
  return { value: field.value, comparator: field.operand ? '$and' : '$or' };
};

const addSource = (sources: string[], value: boolean, name: string) => {
  if (value) {
    sources.push(`fr.openent.mediacentre.source.${name}`);
  }
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
    add: async (session: AuthLoggedAccount, id: string, resource: IResource) => {
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
    getAdvanced: async (session: AuthLoggedAccount, fields: IField[], checkedSources: ISources) => {
      const sources: string[] = [];
      const jsondata = {
        event: 'search',
        state: 'ADVANCED',
        sources,
        data: {},
      };
      addSource(jsondata.sources, checkedSources.GAR, 'GAR');
      addSource(jsondata.sources, checkedSources.Moodle, 'Moodle');
      addSource(jsondata.sources, checkedSources.PMB, 'PMB');
      addSource(jsondata.sources, checkedSources.Signet, 'Signet');
      for (const field of fields) {
        if (field.value !== '') {
          jsondata.data[field.name] = addFieldWhenFilled(field);
        }
      }
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
        .filter(resource => resource.types.includes('Signet'))
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
    searchAdvanced: async (session: AuthLoggedAccount, fields: IField[]) => {
      const api = '/mediacentre/signets/advanced';
      const body = {};
      for (const field of fields) {
        body[field.name] = { value: field.value, comparator: field.operand ? '$and' : '$or' };
      }
      const resources = (await fetchJSONWithCache(api, {
        method: 'POST',
        body: JSON.stringify(body),
      })) as IBackendResourceList;
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
