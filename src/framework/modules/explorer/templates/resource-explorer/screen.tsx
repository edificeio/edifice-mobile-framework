import * as React from 'react';

import { ParamListBase, useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import { PaginatedDocumentFlashList } from '~/framework/components/list/paginated-document-list/component';
import { PaginatedDocumentFlashListProps } from '~/framework/components/list/paginated-document-list/types';
import { ExplorerResourceIdType, RootFolderId } from '~/framework/modules/explorer/model/types';
import service from '~/framework/modules/explorer/service/index';
import { emptyFolderData, ExplorerAction, explorerActions, selectExplorerFolder } from '~/framework/modules/explorer/store';
import { ResourceMedia } from '~/framework/modules/media';
import { HTTPError } from '~/framework/util/transport/error';

import type { ResourceExplorerTemplate } from './types';

export { createResourceExplorerNavBar } from './deprecated';
export { explorerScreenHeader } from './options';

const PAGE_SIZE = 24;

export function ResourceExplorerTemplate({
  context,
  emptyComponent,
  onOpenResource,
  route,
  route: { params: { folderId = RootFolderId.ROOT } = {} },
}: ResourceExplorerTemplate.Props) {
  const folder = useSelector(selectExplorerFolder(context, folderId));
  const content = folder?.content ?? emptyFolderData;
  const dispatch = useDispatch<Dispatch<ExplorerAction>>();
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const isFocused = useIsFocused();

  const loadPage = React.useCallback(
    async (start_idx: number, nb: number, reloadAll: boolean = false) => {
      try {
        const { app, ...response } = await service.resources.get({
          ...context, // 'application' & 'resource_type' fields
          folder: folderId,
          order_by: 'updatedAt:desc',
          page_size: nb,
          start_idx: start_idx,
          trashed: false,
        });
        dispatch(explorerActions.loadPage(app, folderId, response, reloadAll));
      } catch (e) {
        if (e instanceof HTTPError) console.error(await e.read(e.text));
        else console.error(e?.toString());
        throw e;
      }
    },
    [context, folderId, dispatch],
  );
  const onPressFolder = React.useCallback<
    NonNullable<PaginatedDocumentFlashListProps<ExplorerResourceIdType, ResourceMedia>['onPressFolder']>
  >(f => isFocused && navigation.push(route.name, { folderId: f.id }), [isFocused, navigation, route.name]);

  const onPressDocument = React.useCallback<
    NonNullable<PaginatedDocumentFlashListProps<ExplorerResourceIdType, ResourceMedia>['onPressDocument']>
  >(
    document => {
      onOpenResource?.(document);
    },
    [onOpenResource],
  );

  return (
    <PaginatedDocumentFlashList
      ListEmptyComponent={emptyComponent}
      onItemsReached={loadPage}
      documents={content.resources}
      folders={content.folders}
      numColumns={2}
      pageSize={PAGE_SIZE}
      onPressFolder={onPressFolder}
      onPressDocument={onPressDocument}
      alwaysShowAppIcon={false}
    />
  );
}

export default ResourceExplorerTemplate;
