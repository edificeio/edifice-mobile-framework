import { Resource, SectionType, Source } from '~/framework/modules/mediacentre/model';

export type ResourceSection = {
  iconName: string;
  resources: Resource[];
  type: SectionType;
};

export type ResourceListProps = ResourceSection & {
  onAddFavorite: (resource: Resource) => void;
  onRemoveFavorite: (id: string, source: Source) => void;
  openResourceList: (resources: Resource[], title: string) => void;
};
