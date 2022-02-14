import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IUserChildren } from '~/modules/viescolaire/edt/state/userChildren';

export type IUserChildrenBackend = {
  classes: string[];
  displayName: string;
  firstName: string;
  lastName: string;
  id: string;
  idClasses: string;
}[];

const userChildrenAdapter = (data: IUserChildrenBackend): IUserChildren => {
  return data.map(child => ({
    classes: child.classes,
    displayName: child.displayName,
    firstName: child.firstName,
    lastName: child.lastName,
    id: child.id,
    idClasses: child.idClasses,
  }));
};

export const userChildrenService = {
  get: async () => {
    return userChildrenAdapter(await fetchJSONWithCache(`/edt/user/children`));
  },
};
