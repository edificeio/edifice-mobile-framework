import { ParamListBase, Route } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ImagePicked } from '~/framework/components/menus/actions';
import { IWorkspaceUploadParams } from '~/framework/modules/workspace/service';
import type { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';

export namespace FileImportScreenProps {
  export interface Public {}

  export interface NavParams {
    files: ImagePicked[];
    uploadParams: IWorkspaceUploadParams;
    redirectTo: Route<string, ParamListBase>;
  }

  export type Navigation = NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.FileImport>;

  export type NavBarConfig = ({ navigation, route }: Navigation) => NativeStackNavigationOptions;

  export interface AllProps extends Public, Navigation {}
}
