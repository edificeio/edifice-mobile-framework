/**
 * Modals screens available globally
 */
import { ParamListBase } from '@react-navigation/native';

import type { ICarouselNavParams } from '~/framework/components/carousel/screen';
import type { FileImportScreenProps } from '~/framework/components/inputs/rich-text/file-import';
import type { RichEditorFormReduxNavParams } from '~/framework/components/inputs/rich-text/form/types';
import type { MediaPlayerParams } from '~/framework/components/media/player/types';
import { AudienceReactionsScreenNavParams } from '~/framework/modules/audience/screens/reactions/types';
import { AudienceViewsScreenNavParams } from '~/framework/modules/audience/screens/views/types';
import { AttachmentsImportScreenProps } from '~/framework/modules/mails/components/attachments/modal-import';
import { SplashadsScreenNavParams } from '~/framework/modules/splashads/screen/types';

export enum ModalsRouteNames {
  AttachmentsImport = 'attachments-import',
  AudienceReactions = 'audience-reactions',
  AudienceViews = 'audience-views',
  Carousel = 'carousel',
  FileImport = 'file-import',
  Infos = 'infos',
  Log = 'log',
  MediaPlayer = 'media-player',
  Network = 'network',
  Pdf = 'pdf',
  RichTextEditor = 'rich-editor',
  SplashAds = 'splashads',
}

export interface IModalsNavigationParams extends ParamListBase {
  [ModalsRouteNames.Pdf]: { title: string; src?: string };
  [ModalsRouteNames.Carousel]: ICarouselNavParams;
  [ModalsRouteNames.MediaPlayer]: MediaPlayerParams;
  [ModalsRouteNames.AudienceReactions]: AudienceReactionsScreenNavParams;
  [ModalsRouteNames.AudienceViews]: AudienceViewsScreenNavParams;
  [ModalsRouteNames.FileImport]: FileImportScreenProps.NavParams;
  [ModalsRouteNames.AttachmentsImport]: AttachmentsImportScreenProps.NavParams;
  [ModalsRouteNames.RichTextEditor]: RichEditorFormReduxNavParams;
  [ModalsRouteNames.SplashAds]: SplashadsScreenNavParams;
}
