import moment from 'moment';

import { fetchJSONWithCache } from '~/infra/fetchWithCache';

import { HobbieItem, InfoPerson } from '../model';
import { UserType } from '../../auth/service';

interface BackendInfoPerson {
  id: string;
  login: string;
  displayName: string;
  type: string[];
  visibleInfos: string[];
  schools: {
    exports: null | any;
    classes: string[];
    name: string;
    id: string;
    UAI: string;
  }[];
  relatedName: null | string;
  relatedId: null | string;
  relatedType: null | string;
  userId: string;
  motto: string;
  photo: string;
  mood: string;
  health: string;
  address: string;
  email: string;
  tel: null | string;
  mobile: string;
  birthdate: string;
  hobbies: { visibility: string; category: string; values: string }[];
}

interface BackendPerson {
  status: string;
  result: BackendInfoPerson[];
}

export const infoPersonAdapter = (n: BackendInfoPerson) => {
  const ret = {
    id: n.id,
    login: n.login,
    displayName: n.displayName,
    type: n.type[0] as UserType,
    visibleInfos: n.visibleInfos,
    schools: n.schools,
    relatedName: n.relatedName,
    relatedId: n.relatedId,
    relatedType: n.relatedType,
    userId: n.userId,
    motto: n.motto,
    photo: n.photo,
    mood: n.mood,
    health: n.health,
    address: n.address,
    email: n.email,
    tel: n.tel,
    mobile: n.mobile,
    birthdate: moment(n.birthdate),
    hobbies: n.hobbies as HobbieItem[],
  };
  return ret as InfoPerson;
};

export const userService = {
  person: {
    get: async (id?: string) => {
      const api = id ? `/userbook/api/person?id=${id}` : `/userbook/api/person`;
      const backendPerson = (await fetchJSONWithCache(api)) as BackendPerson;

      const person = backendPerson.result.map(person => infoPersonAdapter(person));
      return person as InfoPerson[];
    },
  },
};
