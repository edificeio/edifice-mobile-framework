export interface IUserChild {
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
}
