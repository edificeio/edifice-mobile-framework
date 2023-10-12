import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import type { ScrapbookNavigationParams } from '~/framework/modules/scrapbook/navigation';
import { scrapbookRouteNames } from '~/framework/modules/scrapbook/navigation';
import { IScrapbookNotification } from '~/framework/modules/scrapbook/notif-handler';

export interface ScrapbookDetailsScreenDataProps {
  session?: ISession;
}

export interface ScrapbookDetailsScreenEventProps {}

export interface ScrapbookDetailsScreenNavParams {
  notification: IScrapbookNotification;
}

export type ScrapbookDetailsScreenProps = ScrapbookDetailsScreenDataProps &
  ScrapbookDetailsScreenEventProps &
  NativeStackScreenProps<ScrapbookNavigationParams, typeof scrapbookRouteNames.details>;
