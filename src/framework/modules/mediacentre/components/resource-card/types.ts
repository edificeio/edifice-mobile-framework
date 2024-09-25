import { Resource } from '~/framework/modules/mediacentre/model';

export type ResourceCardProps = {
  resource: Resource;
  onAddFavorite: () => any;
  onRemoveFavorite: () => any;
};
