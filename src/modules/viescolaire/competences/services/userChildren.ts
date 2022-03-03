import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IUserChildren } from '~/modules/viescolaire/competences/state/userChildren';

export type IUserChildrenBackend = {
  displayName: string;
  firstName: string;
  id: string;
  idClasse: string;
  idStructure: string;
  lastName: string;
}[];

const userChildrenAdapter = (data: IUserChildrenBackend): IUserChildren => {
  return data.map(child => ({
    displayName: child.displayName,
    firstName: child.firstName,
    id: child.id,
    idClasse: child.idClasse,
    idStructure: child.idStructure,
    lastName: child.lastName,
  }));
};

export const userChildrenService = {
  get: async (relativeId: string) => {
    return userChildrenAdapter(await fetchJSONWithCache(`/competences/enfants?userId=${relativeId}`));
  },
};
