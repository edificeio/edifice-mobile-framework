import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import type { ScrapbookNavigationParams } from '~/framework/modules/scrapbook/navigation';
import { scrapbookRouteNames } from '~/framework/modules/scrapbook/navigation';

export interface ScrapbookHomeScreenDataProps {
  session?: AuthLoggedAccount;
}

export interface ScrapbookHomeScreenEventProps {}

export interface ScrapbookHomeScreenNavParams {}

export type ScrapbookHomeScreenProps = ScrapbookHomeScreenDataProps &
  ScrapbookHomeScreenEventProps &
  NativeStackScreenProps<ScrapbookNavigationParams, typeof scrapbookRouteNames.home>;
