import { ParamListBase, Route } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ImagePicked } from '~/framework/components/menus/actions';
import type { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { IPickOptions } from '~/framework/util/fileHandler';

export interface AttachmentsImportScreenDataProps {}
export interface AttachmentsImportScreenEventProps {}
export interface AttachmentsImportScreenNavParams {
  files: ImagePicked[];
  redirectTo: Route<string, ParamListBase>;
  source: IPickOptions['source'];
  draftId: string;
}
export type AttachmentsImportScreenProps = AttachmentsImportScreenDataProps &
  AttachmentsImportScreenEventProps &
  NativeStackScreenProps<IModalsNavigationParams, typeof ModalsRouteNames.AttachmentsImport>;
