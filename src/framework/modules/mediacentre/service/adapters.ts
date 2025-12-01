import { Resource, Source } from '~/framework/modules/mediacentre/model';
import { BackendResource } from '~/framework/modules/mediacentre/service/types';

export const transformArray = (array: string[] | [number, string][]): string[] =>
  array.map((value: string | [number, string]) => (Array.isArray(value) ? value[1] : value));

export const resourceAdapter = (data: BackendResource): Resource => {
  const id = (data._id ?? typeof data.id === 'number') ? data.id.toString() : data.id;
  return {
    authors: data.owner_name ?? data.authors,
    disciplines: data.disciplines ? transformArray(data.disciplines) : [],
    editors: data.editors,
    id,
    image: data.image,
    isParent: data.is_parent,
    isTextbook: data.is_textbook,
    levels: transformArray(data.levels),
    link: (data.link ?? data.url) as string,
    pinnedDescription: data.pinned_description,
    source: data.source ?? Source.SIGNET,
    themes:
      data.source === Source.SIGNET
        ? data.orientation || data.document_types?.includes('Orientation')
          ? ['Orientation et découverte des métiers']
          : ['Sans thématique']
        : undefined,
    title: data.pinned_title ?? data.title,
    types: data.document_types?.filter(value => value !== 'Orientation') ?? ['livre numérique'],
    uid: data.structure_uai ? data.id + data.structure_uai : id,
  };
};
