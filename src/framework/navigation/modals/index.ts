/**
 * Modals screens available globally
 */
import { ParamListBase } from '@react-navigation/native';

import type { ICarouselNavParams } from '~/framework/components/carousel/screen';
import type { FileImportScreenProps } from '~/framework/components/inputs/rich-text/file-import';
import type { RichEditorFormReduxNavParams } from '~/framework/components/inputs/rich-text/form/types';
import type { MediaPlayerParams } from '~/framework/components/media/player/types';

export enum ModalsRouteNames {
  Pdf = '$pdf',
  Carousel = '$carousel',
  MediaPlayer = '$mediaPlayer',
  RichTextEditor = '$richTextEditor',
  FileImport = 'file-import',
}

export interface IModalsNavigationParams extends ParamListBase {
  [ModalsRouteNames.Pdf]: { title: string; src?: string };
  [ModalsRouteNames.Carousel]: ICarouselNavParams;
  [ModalsRouteNames.MediaPlayer]: MediaPlayerParams;
  [ModalsRouteNames.FileImport]: FileImportScreenProps.NavParams;
  [ModalsRouteNames.RichTextEditor]: RichEditorFormReduxNavParams;
}
