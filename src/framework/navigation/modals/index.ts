/**
 * Modals screens available globally
 */
import { ParamListBase } from '@react-navigation/native';

import { RichTextEditorScreenNavParams } from '~/framework/components/inputs/rich-text-editor';
import { MediaType } from '~/framework/components/media/player';
import { IMedia } from '~/framework/util/media';

export enum ModalsRouteNames {
  Pdf = '$pdf',
  Carousel = '$carousel',
  MediaPlayer = '$mediaPlayer',
  RichTextEditor = '$richTextEditor',
}

export interface IModalsNavigationParams extends ParamListBase {
  [ModalsRouteNames.Pdf]: { title: string; src?: string };
  [ModalsRouteNames.Carousel]: {
    data: IMedia[];
    startIndex?: number;
  };
  [ModalsRouteNames.MediaPlayer]: {
    type: MediaType;
    source: any;
    filetype?: string;
  };
  [ModalsRouteNames.RichTextEditor]: RichTextEditorScreenNavParams;
}
