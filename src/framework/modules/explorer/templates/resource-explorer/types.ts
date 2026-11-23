import type { ParamListBase, RouteProp } from '@react-navigation/native';
import { FlashListProps } from '@shopify/flash-list';

import { DocumentItem, FolderItem } from '~/framework/components/list/paginated-document-list/types';
import type { ExplorerResourceIdType, FolderId } from '~/framework/modules/explorer/model/types';
import { API } from '~/framework/modules/explorer/service/types';
import { ResourceMedia } from '~/framework/modules/media';

export namespace ResourceExplorerTemplate {
  /** Params of the route of the screen that shows the template. */
  export interface NavParams {
    folderId?: FolderId;
    folderName?: FolderItem<FolderId>['title'];
  }

  export interface Props {
    /** The route of the screen that shows the template: opening a folder pushes this route again, with the folder. */
    route: Pick<RouteProp<ParamListBase>, 'name'> & { params?: NavParams };
    onOpenResource?: (r: DocumentItem<ExplorerResourceIdType, ResourceMedia>) => void;
    emptyComponent?: FlashListProps<any>['ListEmptyComponent'];
    context: API.Explorer.ContextQuery;
  }
}
