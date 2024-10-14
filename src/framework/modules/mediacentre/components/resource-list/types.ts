import { Resource, SectionType } from '~/framework/modules/mediacentre/model';

export type ResourceSection = {
  resources: Resource[];
  type: SectionType;
  iconName?: string;
};

export type ResourceListProps = ResourceSection & {
  disableShowAll?: boolean;
  isResourceFavorite: (uid: string) => boolean;
  onAddFavorite: (resource: Resource) => void;
  onRemoveFavorite: (resource: Resource) => void;
  openResourceList: (resources: Resource[], section: SectionType) => void;
};
