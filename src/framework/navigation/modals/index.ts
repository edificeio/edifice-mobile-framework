/**
 * Modals screens available globally
 */
import { ParamListBase } from '@react-navigation/native';

import { IMedia } from '~/framework/util/media';

export enum ModalsRouteNames {
  Pdf = '$pdf',
  Carousel = '$carousel',
}

export interface IModalsNavigationParams extends ParamListBase {
  [ModalsRouteNames.Pdf]: { title: string; src?: string };
  [ModalsRouteNames.Carousel]: {
    data: IMedia[];
    startIndex?: number;
  };
}
