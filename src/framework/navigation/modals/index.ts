/**
 * Modals screens available globally
 */
import { ParamListBase } from '@react-navigation/native';

import type { CarouselNavParams } from '~/framework/components/carousel/screen/types';
import type { FileImportScreenProps } from '~/framework/components/inputs/rich-text/file-import';
import type { RichEditorFormReduxNavParams } from '~/framework/components/inputs/rich-text/form/types';
import type { DownloadModalNavParams } from '~/framework/components/modals/download/types';
import { AudienceReactionsScreenNavParams } from '~/framework/modules/audience/screens/reactions/types';
import { AudienceViewsScreenNavParams } from '~/framework/modules/audience/screens/views/types';
import { AttachmentsImportScreenProps } from '~/framework/modules/mails/components/attachments/modal-import';
import { SplashadsScreenNavParams } from '~/framework/modules/splashads/screen/types';

export enum ModalsRouteNames {
  AttachmentsImport = 'attachments-import',
  AudienceReactions = 'audience-reactions',
  AudienceViews = 'audience-views',
  Carousel = 'carousel',
  Download = 'download',
  FileImport = 'file-import',
  Infos = 'infos',
  Log = 'log',
  Network = 'network',
  Pdf = 'pdf',
  RichTextEditor = 'rich-editor',
  SplashAds = 'splashads',
  FavoritesManagement = 'favorites-management',
  FavoritesReorder = 'favorites-reorder',
}

export interface IModalsNavigationParams extends ParamListBase {
  [ModalsRouteNames.Pdf]: { title: string; src?: string };
  [ModalsRouteNames.Carousel]: CarouselNavParams;
  [ModalsRouteNames.Download]: DownloadModalNavParams;
  [ModalsRouteNames.AudienceReactions]: AudienceReactionsScreenNavParams;
  [ModalsRouteNames.AudienceViews]: AudienceViewsScreenNavParams;
  [ModalsRouteNames.FileImport]: FileImportScreenProps.NavParams;
  [ModalsRouteNames.AttachmentsImport]: AttachmentsImportScreenProps.NavParams;
  [ModalsRouteNames.RichTextEditor]: RichEditorFormReduxNavParams;
  [ModalsRouteNames.SplashAds]: SplashadsScreenNavParams;
  [ModalsRouteNames.FavoritesManagement]: undefined;
  [ModalsRouteNames.FavoritesReorder]: undefined;
}
