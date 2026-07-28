import * as React from 'react';

import { useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { getStore } from '~/app/store';
import { PaginatedDocumentFlashList } from '~/framework/components/list/paginated-document-list/component';
import { PaginatedDocumentFlashListProps } from '~/framework/components/list/paginated-document-list/types';
import { ExplorerResourceIdType, RootFolderId } from '~/framework/modules/explorer/model/types';
import service from '~/framework/modules/explorer/service/index';
import { emptyFolderData, ExplorerAction, useExplorerActions } from '~/framework/modules/explorer/store';
import { ResourceMedia } from '~/framework/modules/media';
import { HTTPError } from '~/framework/util/transport/error';

import type { ResourceExplorerTemplate } from './types';

const PAGE_SIZE = 24;

export const createResourceExplorerNavBar = (homeFolderi18n: string, selectors: ResourceExplorerTemplate.AllProps['selectors']) =>
  screenOptions(({ route: { params: { folderId = RootFolderId.ROOT } = {} } }) => {
    const folder = selectors.folder(folderId)(getStore().getState());
    return { title: folder?.metadata?.title ?? I18n.get(homeFolderi18n) };
  });

export function ResourceExplorerTemplate({
  context,
  emptyComponent,
  moduleConfig,
  navigation,
  onOpenResource,
  route,
  route: { params: { folderId = RootFolderId.ROOT } = {} },
  selectors,
}: ResourceExplorerTemplate.AllProps) {
  const folder = useSelector(selectors.folder(folderId));
  const content = folder?.content ?? emptyFolderData;
  const dispatch = useDispatch<Dispatch<ExplorerAction>>();
  const actions = useExplorerActions(moduleConfig);
  const isFocused = useIsFocused();

  const loadPage = React.useCallback(
    async (start_idx: number, nb: number, reloadAll: boolean = false) => {
      // DUMMY WAIT
      // if (__DEV__) await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        const response = await service.resources.get({
          ...context, // 'application' & 'resource_type' fields
          folder: folderId,
          order_by: 'updatedAt:desc',
          page_size: nb,
          start_idx: start_idx,
          trashed: false,
        });
        dispatch(actions.loadPage(folderId, response, reloadAll));
      } catch (e) {
        if (e instanceof HTTPError) console.error(await e.read(e.text));
        else console.error(e?.toString());
        throw e;
      }
    },
    [context, folderId, dispatch, actions],
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
