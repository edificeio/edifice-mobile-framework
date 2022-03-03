import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IUserChildren } from '~/modules/viescolaire/presences/state/userChildren';

export type IUserChildrenBackend = {
  birth: string;
  displayName: string;
  firstName: string;
  id: string;
  lastName: string;
  structures: {
    classes: {
      id: string;
      name: string;
      structure: string;
    }[];
    id: string;
    name: string;
  }[];
}[];

const userChildrenAdapter = (data: IUserChildrenBackend): IUserChildren => {
  return data.map(child => ({
    birth: child.birth,
    displayName: child.displayName,
    firstName: child.firstName,
    id: child.id,
    lastName: child.lastName,
    structures: child.structures,
  }));
};

export const userChildrenService = {
  get: async (relativeId: string) => {
    return userChildrenAdapter(await fetchJSONWithCache(`/presences/children?relativeId=${relativeId}`));
  },
};
