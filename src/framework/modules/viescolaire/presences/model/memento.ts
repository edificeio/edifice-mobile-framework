import type { Moment } from 'moment';

export interface IMemento {
  accommodation: string | null;
  birthDate: Moment | null;
  classes: string[];
  groups: string[];
  id: string;
  name: string;
  relatives: {
    address: string | null;
    email: string;
    id: string;
    mobile: string;
    name: string;
    phone: string;
    title: string | null;
  }[];
}
