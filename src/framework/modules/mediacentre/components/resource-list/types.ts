import { Resource, Source } from '~/framework/modules/mediacentre/model';

export type ResourceSection = {
  iconName: string;
  resources: Resource[];
  sectionKey: string;
};

export type ResourceListProps = ResourceSection & {
  onAddFavorite: (id: string, resource: Resource) => void;
  onRemoveFavorite: (id: string, source: Source) => void;
  openResourceList: (resources: Resource[]) => void;
};
