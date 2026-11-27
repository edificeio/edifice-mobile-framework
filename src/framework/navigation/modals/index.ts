/**
 * Modals screens available globally
 */
import { ParamListBase } from '@react-navigation/native';

import type { FileImportScreenProps } from '~/framework/components/inputs/rich-text/file-import';
import type { RichEditorFormReduxNavParams } from '~/framework/components/inputs/rich-text/form/types';
import { AttachmentsImportScreenProps } from '~/framework/modules/mails/components/attachments/modal-import';
import { SplashadsScreenNavParams } from '~/framework/modules/splashads/screen/types';

export enum ModalsRouteNames {
  AttachmentsImport = 'attachments-import',
  FileImport = 'file-import',
  Infos = 'infos',
  Log = 'log',
  Network = 'network',
  Pdf = 'pdf',
  RichTextEditor = 'rich-editor',
  SplashAds = 'splashads',
}

export interface IModalsNavigationParams extends ParamListBase {
  [ModalsRouteNames.Pdf]: { title: string; src?: string };
  [ModalsRouteNames.FileImport]: FileImportScreenProps.NavParams;
  [ModalsRouteNames.AttachmentsImport]: AttachmentsImportScreenProps.NavParams;
  [ModalsRouteNames.RichTextEditor]: RichEditorFormReduxNavParams;
  [ModalsRouteNames.SplashAds]: SplashadsScreenNavParams;
}
