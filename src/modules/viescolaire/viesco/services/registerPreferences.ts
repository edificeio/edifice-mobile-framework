import { fetchJSONWithCache } from "../../../../infra/fetchWithCache";
import { IRegisterPreferences } from "../../viesco/state/registerPreferences";

export type IRegisterPreferencesBackend = {
  preference: string;
};

const registerPreferencesAdapter: (data: IRegisterPreferencesBackend) => IRegisterPreferences = data => {
  let result = {} as IRegisterPreferences;
  if (!data) return result;
  result = {
    preference: data.preference,
  };
  return result;
};

export const registerPreferencesService = {
  get: async () => {
    return registerPreferencesAdapter(await fetchJSONWithCache(`/userbook/preference/presences.register`));
  },
};
