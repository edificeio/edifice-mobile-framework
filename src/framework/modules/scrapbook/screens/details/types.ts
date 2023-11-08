import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import type { ScrapbookNavigationParams } from '~/framework/modules/scrapbook/navigation';
import { scrapbookRouteNames } from '~/framework/modules/scrapbook/navigation';

export interface ScrapbookDetailsScreenDataProps {
  session?: ISession;
}

export interface ScrapbookDetailsScreenEventProps {}

export interface ScrapbookDetailsScreenNavParams {
  resourceUri: string;
}

export type ScrapbookDetailsScreenProps = ScrapbookDetailsScreenDataProps &
  ScrapbookDetailsScreenEventProps &
  NativeStackScreenProps<ScrapbookNavigationParams, typeof scrapbookRouteNames.details>;
