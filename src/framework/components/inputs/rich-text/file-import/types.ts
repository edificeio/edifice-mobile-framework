import { ParamListBase, Route } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import { IWorkspaceUploadParams } from '~/framework/modules/workspace/service/types';
import type { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { FileManagerModuleName, FileManagerUsecaseName } from '~/framework/util/fileHandler/fileManagerConfig';
import { LocalFile } from '~/framework/util/fileHandler/models/localFile';
import { FileSource } from '~/framework/util/fileHandler/types';

export namespace FileImportScreenProps {
  export interface Public {}

  export interface NavParams {
    files: LocalFile[];
    uploadParams: IWorkspaceUploadParams;
    redirectTo: Route<string, ParamListBase>;
    source: FileSource;
    module: FileManagerModuleName;
    usecase: FileManagerUsecaseName<FileManagerModuleName>;
  }

  export type Navigation = NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.FileImport>;

  export type NavBarConfig = ({ navigation, route }: Navigation) => NativeStackNavigationOptions;

  export interface AllProps extends Public, Navigation {}
}
