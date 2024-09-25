import { Resource } from '~/framework/modules/mediacentre/model';

export type ResourceCardProps = {
  resource: Resource;
  variant?: 'default' | 'preview';
  onAddFavorite: () => any;
  onRemoveFavorite: () => any;
};
