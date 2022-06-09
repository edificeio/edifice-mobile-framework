import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IResource, Source } from '~/modules/mediacentre/utils/Resource';

// Data type of what is given by the backend.

export type IResourceBackend = {
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
}[];

export function compareResources(a: IResource, b: IResource) {
  return a.title.localeCompare(b.title);
}

export function transformArray(array: string[]) {
  array = array.map(value => (Array.isArray(value) && value.length > 1 ? value[1] : value));
  return array;
}

export const resourcesAdapter: (data: IResourceBackend) => IResource[] = data => {
  const resources = [] as IResource[];
  if (!data || !Array.isArray(data)) {
    return [];
  }
  for (const resource of data) {
    const res = {
      id: resource.id,
      uid: resource.structure_uai ? resource.id + resource.structure_uai : resource._id,
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

export const textbooksService = {
  get: async () => {
    const response = await fetchJSONWithCache(`/mediacentre/textbooks`);
    return resourcesAdapter(response.data.textbooks);
  },
};
