import moment from 'moment';

import { AccountType } from '~/framework/modules/auth/model';
import { HobbieItem, InfoPerson } from '~/framework/modules/user/model';
import { hobbiesItems } from '~/framework/modules/user/screens/profile';
import { fetchJSONWithCache, signedFetchJsonRelative } from '~/infra/fetchWithCache';

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
  birthdate: null | string;
  hobbies: { visibility: string; category: string; values: string }[];
}

interface BackendPerson {
  status: string;
  result: BackendInfoPerson[];
}

export const infoPersonAdapter = (n: BackendInfoPerson) => {
  const orderedHobbies: HobbieItem[] = [];
  hobbiesItems.forEach(hobbie => {
    const index = n.hobbies.findIndex(hobbieItem => hobbieItem.category === hobbie);
    if (index !== -1) orderedHobbies.push((n.hobbies as HobbieItem[])[index]);
  });

  const ret = {
    address: n.address,
    birthdate: n.birthdate ? moment(n.birthdate) : null,
    displayName: n.displayName,
    email: n.email,
    health: n.health,
    hobbies: orderedHobbies,
    id: n.id,
    login: n.login,
    mobile: n.mobile,
    mood: n.mood,
    motto: n.motto,
    photo: n.photo,
    relatedId: n.relatedId,
    relatedName: n.relatedName,
    relatedType: n.relatedType,
    schools: n.schools,
    tel: n.tel,
    type: n.type[0] as AccountType,
    userId: n.userId,
    visibleInfos: n.visibleInfos,
  };
  return ret as InfoPerson;
};

export const userService = {
  person: {
    editHealthVisibility: async (visibility: 'prive' | 'public') => {
      const api = `/userbook/api/edit-user-info-visibility?info=health&state=${visibility}`;

      return fetchJSONWithCache(api);
    },
    get: async (id?: string) => {
      const api = id ? `/userbook/api/person?id=${id}` : `/userbook/api/person`;
      const backendPerson = (await fetchJSONWithCache(api)) as BackendPerson;

      const person = backendPerson.result.map(p => infoPersonAdapter(p));
      return person as InfoPerson[];
    },
    put: async (userId: string, body) => {
      const api = `/directory/userbook/${userId}`;

      return signedFetchJsonRelative(`${api}`, {
        body,
        method: 'PUT',
      });
    },
  },
};
