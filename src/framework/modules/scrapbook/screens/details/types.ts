import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import type { ScrapbookNavigationParams } from '~/framework/modules/scrapbook/navigation';
import { scrapbookRouteNames } from '~/framework/modules/scrapbook/navigation';

export interface ScrapbookDetailsScreenDataProps {
  session?: AuthLoggedAccount;
}

export interface ScrapbookDetailsScreenEventProps {}

export interface ScrapbookDetailsScreenNavParams {
  resourceUri: string;
  headerHeight: number;
}

export type ScrapbookDetailsScreenProps = ScrapbookDetailsScreenDataProps &
  ScrapbookDetailsScreenEventProps &
  NativeStackScreenProps<ScrapbookNavigationParams, typeof scrapbookRouteNames.details>;
