import { FlashListProps } from '@shopify/flash-list';

import { DocumentItem, FolderItem } from '~/framework/components/list/paginated-document-list/types';
import type { ExplorerResourceIdType, FolderId } from '~/framework/modules/explorer/model/types';
import { API } from '~/framework/modules/explorer/service/types';
import { ResourceMedia } from '~/framework/modules/media';

export namespace ResourceExplorerTemplate {
  /**
   * Params of the route of the screen that shows the template (read by the template with `useRoute`).
   * A `type`, not an `interface`: the params of a route must be a `Record<string, unknown>`.
   */
  export type NavParams = {
    folderId?: FolderId;
    folderName?: FolderItem<FolderId>['title'];
  };

  export interface Props {
    onOpenResource?: (r: DocumentItem<ExplorerResourceIdType, ResourceMedia>) => void;
    emptyComponent?: FlashListProps<any>['ListEmptyComponent'];
    context: API.Explorer.ContextQuery;
  }
}
