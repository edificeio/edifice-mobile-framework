import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ScrapbookNavigationParams } from '~/framework/modules/scrapbook/navigation';
import { scrapbookRouteNames } from '~/framework/modules/scrapbook/navigation';

export interface ScrapbookHomeScreenNavParams {}

export type ScrapbookHomeScreenProps = NativeStackScreenProps<ScrapbookNavigationParams, typeof scrapbookRouteNames.home>;
