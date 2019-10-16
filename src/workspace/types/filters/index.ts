export enum FilterId {
  owner = "owner",
  shared = "shared",
  protected = "protected",
  trash = "trash"
}

export interface IFiltersParameters {
  filter?: FilterId;
  parentId?: string;
};
