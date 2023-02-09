export interface IRelative {
  id: string;
  title: string;
  name: string;
  mobile: string;
  phone: string;
  address: string;
  email: string;
  activated: boolean;
  primary: boolean;
}

export interface IMemento {
  id: string;
  name: string;
  birth_date: string;
  classes: string[];
  groups: string[];
  comment: string;
  accommodation: string;
  relatives: IRelative[];
}
