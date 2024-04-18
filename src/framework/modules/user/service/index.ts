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
    id: n.id,
    login: n.login,
    displayName: n.displayName,
    type: n.type[0] as AccountType,
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
    birthdate: n.birthdate ? moment(n.birthdate) : null,
    hobbies: orderedHobbies,
  };
  return ret as InfoPerson;
};

export const userService = {
  person: {
    get: async (id?: string) => {
      const api = id ? `/userbook/api/person?id=${id}` : `/userbook/api/person`;
      const backendPerson = (await fetchJSONWithCache(api)) as BackendPerson;

      const person = backendPerson.result.map(p => infoPersonAdapter(p));
      return person as InfoPerson[];
    },
    put: async (userId: string, body) => {
      const api = `/directory/userbook/${userId}`;

      return signedFetchJsonRelative(`${api}`, {
        method: 'PUT',
        body,
      });
    },
    editHealthVisibility: async (visibility: 'prive' | 'public') => {
      const api = `/userbook/api/edit-user-info-visibility?info=health&state=${visibility}`;

      return fetchJSONWithCache(api);
    },
  },
};
