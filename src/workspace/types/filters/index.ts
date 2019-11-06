export enum FilterId {
  owner = "owner",
  shared = "shared",
  protected = "protected",
  root = "root",
  trash = "trash"
}

export interface IFiltersParameters {
  filter?: FilterId;
  parentId?: string;
};
