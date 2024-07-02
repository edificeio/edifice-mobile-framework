/**
 * Modals screens available globally
 */
import { ParamListBase } from '@react-navigation/native';

import type { CarouselScreen } from '~/framework/components/carousel/types';
import type { ICarouselNavParams } from '~/framework/components/carousel-old/screen';
import type { FileImportScreenProps } from '~/framework/components/inputs/rich-text/file-import';
import type { RichEditorFormReduxNavParams } from '~/framework/components/inputs/rich-text/form/types';
import type { MediaPlayerParams } from '~/framework/components/media/player/types';
import type { AudienceReactionsScreenNavParams } from '~/framework/modules/core/audience/screens/reactions/types';
import type { AudienceViewsScreenNavParams } from '~/framework/modules/core/audience/screens/views/types';

export enum ModalsRouteNames {
  Pdf = '$pdf',
  CarouselOld = '$carousel',
  MediaPlayer = '$mediaPlayer',
  RichTextEditor = '$richTextEditor',
  AudienceReactions = '$audienceReactions',
  AudienceViews = '$audienceViews',
  FileImport = 'file-import',
}

export const globalRouteNames = {
  'file-import': 'file-import' as const,
  carousel: 'carousel' as const,
};

export interface IModalsNavigationParams extends ParamListBase {
  [ModalsRouteNames.Pdf]: { title: string; src?: string };
  [ModalsRouteNames.CarouselOld]: ICarouselNavParams;
  [ModalsRouteNames.MediaPlayer]: MediaPlayerParams;
  [ModalsRouteNames.AudienceReactions]: AudienceReactionsScreenNavParams;
  [ModalsRouteNames.AudienceViews]: AudienceViewsScreenNavParams;
  'file-import': FileImportScreenProps.NavParams;
  [ModalsRouteNames.RichTextEditor]: RichEditorFormReduxNavParams;
  carousel: CarouselScreen.NavParams;
}
