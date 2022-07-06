export enum Filter {
  OWNER = 'owner',
  PROTECTED = 'protected',
  ROOT = 'root',
  SHARED = 'shared',
  TRASH = 'trash',
}

export interface IFiltersParameters {
  filter: Filter;
  parentId: string;
}
