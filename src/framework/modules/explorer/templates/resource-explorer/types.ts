import type { ParamListBase } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashListProps } from '@shopify/flash-list';

import { createExplorerSelectors } from '../../store';

import type { Folder, FolderId, Resource } from '~/framework/modules/explorer/model/types';
import { API } from '~/framework/modules/explorer/service/types';
import type { AnyNavigableModuleConfig } from '~/framework/util/moduleTool';

export namespace ResourceExplorerTemplate {
  export interface Props {
    moduleConfig: Pick<AnyNavigableModuleConfig, 'displayPicture' | 'displayColor' | 'namespaceActionType'>;
    onOpenResource?: (r: Resource) => void;
    selectors: ReturnType<typeof createExplorerSelectors>;
    emptyComponent?: FlashListProps<any>['ListEmptyComponent'];
    context: API.Explorer.ContextQuery;
  }

  export interface NavParams {
    folderId?: FolderId;
    folderName?: Folder['name'];
  }

  export type NavigationProps<
    T extends ParamListBase = {
      [key: string]: NavParams;
    },
  > = NativeStackScreenProps<T, keyof T>;

  export type NavBarConfig = ({ navigation, route }: NavigationProps) => NativeStackNavigationOptions;

  export interface AllProps extends Props, NavigationProps {}

  export type ScreenProps = Omit<AllProps, keyof Props>;
}
