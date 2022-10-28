import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IMemento, IRelativesInfos } from '~/modules/viescolaire/presences/state/memento';

export type IMementoBackend = {
  id: string;
  name: string;
  birth_date: string;
  classes: string[];
  groups: string[];
  comment: string;
  accommodation: string;
  relatives: IRelativesInfos[];
};

const mementoAdapter: (data: IMementoBackend) => IMemento = data => {
  let result = {} as IMemento;
  if (!data) return result;
  result = {
    id: data.id,
    name: data.name,
    birth_date: data.birth_date,
    classes: data.classes,
    groups: data.groups,
    comment: data.comment,
    relatives: data.relatives,
    accommodation: data.accommodation,
  };
  return result;
};

export const mementoService = {
  get: async (studentId: string) => {
    return mementoAdapter(await fetchJSONWithCache(`/viescolaire/memento/students/${studentId}`));
  },
};
