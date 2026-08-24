import { ModuleScreenProps } from '~/app/navigation/types';

export interface HomeScreenProps extends ModuleScreenProps<'home'> {}

export type HomeTabsParamList = {
  'home/notifications': undefined;
  'home/overview': undefined;
};
