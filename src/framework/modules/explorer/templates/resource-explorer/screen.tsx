import * as React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import type { ResourceExplorerTemplate } from './types';

import { I18n } from '~/app/i18n';
import { getStore } from '~/app/store';
import { UI_SIZES } from '~/framework/components/constants';
import { PaginatedDocumentFlashList } from '~/framework/components/list/paginated-document-list/component';
import { DocumentItemEntApp, PaginatedDocumentFlashListProps } from '~/framework/components/list/paginated-document-list/types';
import { PageView } from '~/framework/components/page';
import { ExplorerAppTypes, ExplorerResourceIdType, RootFolderId } from '~/framework/modules/explorer/model/types';
import service from '~/framework/modules/explorer/service/index';
import { emptyFolderData, ExplorerAction, useExplorerActions } from '~/framework/modules/explorer/store';
import { navBarOptions } from '~/framework/navigation/navBar';
import { HTTPError } from '~/framework/util/http';

const estimatedListSize = {
  height: UI_SIZES.getViewHeight(),
  width: UI_SIZES.screen.width,
};

const PAGE_SIZE = 24;

export const createResourceExplorerNavBar =
  (homeFolderi18n: string, selectors: ResourceExplorerTemplate.AllProps['selectors']) =>
  ({ navigation, route }) => {
    const { folderId = RootFolderId.ROOT } = route.params;
    const folder = selectors.folder(folderId)(getStore().getState());
    return {
      ...navBarOptions({
        navigation,
        route,
        title: folder?.metadata?.title ?? I18n.get(homeFolderi18n),
      }),
    };
  };

export function ResourceExplorerTemplate({
  context,
  emptyComponent,
  moduleConfig,
  navigation,
  onOpenResource,
  route,
  selectors,
}: ResourceExplorerTemplate.AllProps) {
  const { folderId = RootFolderId.ROOT } = route.params;

  const folder = useSelector(selectors.folder(folderId));
  const content = folder?.content ?? emptyFolderData;
  const dispatch = useDispatch<Dispatch<ExplorerAction>>();
  const actions = useExplorerActions(moduleConfig);

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
    NonNullable<PaginatedDocumentFlashListProps<ExplorerAppTypes, ExplorerResourceIdType>['onPressFolder']>
  >(f => navigation.push(route.name, { folderId: f.id }), [navigation, route.name]);

  const onPressDocument = React.useCallback<
    NonNullable<PaginatedDocumentFlashListProps<ExplorerAppTypes, ExplorerResourceIdType>['onPressDocument']>
  >(
    document => {
      onOpenResource?.(document as DocumentItemEntApp<ExplorerAppTypes, string>);
    },
    [onOpenResource],
  );

  return (
    <PageView>
      <PaginatedDocumentFlashList
        estimatedListSize={estimatedListSize}
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
    </PageView>
  );
}

export default ResourceExplorerTemplate;
