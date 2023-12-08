/**
 * Data model for the module user
 */

import { Moment } from 'moment';

import { AccountTyoe } from '../../auth/model';

export enum HobbieVisibility {
  PRIVE = 'PRIVE',
  PUBLIC = 'PUBLIC',
}

export interface HobbieItem {
  visibility: HobbieVisibility;
  category: string;
  values: string;
}

export interface InfoPerson {
  id: string;
  login: string;
  displayName: string;
  type: AccountTyoe;
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
  birthdate: null | Moment;
  hobbies: HobbieItem[];
}
