import * as React from 'react';

import { FlashListProps, ViewToken } from '@shopify/flash-list';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import type { ResourceExplorerTemplate } from './types';

import { I18n } from '~/app/i18n';
import { getStore } from '~/app/store';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { PageView } from '~/framework/components/page';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import ResourceGrid from '~/framework/modules/explorer/components/resource-grid';
import { ResourceGrid as ResourceGridTypes } from '~/framework/modules/explorer/components/resource-grid/types';
import { ExplorerFolderContent, RootFolderId } from '~/framework/modules/explorer/model/types';
import service from '~/framework/modules/explorer/service/index';
import { emptyFolderData, ExplorerAction, useExplorerActions } from '~/framework/modules/explorer/store';
import { navBarOptions } from '~/framework/navigation/navBar';
import { HTTPError } from '~/framework/util/http';

const estimatedListSize = {
  height: UI_SIZES.getViewHeight(),
  width: UI_SIZES.screen.width,
};

const viewabilityConfig: FlashListProps<ExplorerFolderContent['items'][0]>['viewabilityConfig'] = {
  itemVisiblePercentThreshold: 0,
  minimumViewTime: 250,
  waitForInteraction: false,
};

const PAGE_SIZE = 24;
const WINDOW_SLOP = 12; // How many margin to compute which items to load outside the visible ones

const placeholderData = new Array(8).fill(null);

export const createResourceExplorerNavBar =
  (homeFolderi18n: string, selectors: ResourceExplorerTemplate.AllProps['selectors']) =>
  ({ navigation, route }) => {
    const { folderId = RootFolderId.ROOT } = route.params;
    const folder = selectors.folder(folderId)(getStore().getState());
    return {
      ...navBarOptions({
        navigation,
        route,
        title: folder?.metadata?.name ?? I18n.get(homeFolderi18n),
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
  // Note: here store a ref to the state because `onViewableItemsChanged` won't be refreshed by state updates.
  const folderContentRef = React.useRef(content);
  folderContentRef.current = content;

  // Pages currenlty fetching
  const fetchingPages = React.useRef<Set<number>>(new Set());

  const loadPage = React.useCallback(
    async (start_idx: number, reloadAll: boolean = false) => {
      // DUMMY WAIT
      // if (__DEV__) await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        const response = await service.resources.get({
          ...context, // 'application' & 'resource_type' fields
          folder: folderId,
          order_by: 'updatedAt:desc',
          page_size: PAGE_SIZE,
          start_idx: start_idx,
        });
        dispatch(actions.loadPage(folderId, response, reloadAll));
      } catch (e) {
        if (e instanceof HTTPError) console.error(await e.read(e.text));
        else console.error(e?.toString());
        throw e;
      }
    },
    [actions, dispatch, folderId, context],
  );

  /**
   * Algorithm here computes which pages are visible for current scroll position & call fetchOage() for surrounding pages.
   */
  const onViewableItemsChanged = React.useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      const firstVisibleItem = viewableItems.at(0)?.index;
      const lastVisibleItem = viewableItems.at(-1)?.index;
      // console.info(`VISIBLE ITEMS FROM ${firstVisibleItem} to ${lastVisibleItem}`);
      if (
        firstVisibleItem === undefined ||
        firstVisibleItem === null ||
        lastVisibleItem === undefined ||
        lastVisibleItem === null
      ) {
        return;
      }
      const firstVisibleResource = firstVisibleItem - folderContentRef.current.nbFolders - WINDOW_SLOP;
      const lastVisibleResource = lastVisibleItem - folderContentRef.current.nbFolders + WINDOW_SLOP;
      // console.info(`VISIBLE RESOURCES FROM ${firstVisibleResource} to ${lastVisibleResource}`);

      const firstVisiblePage = Math.max(0, firstVisibleResource - (firstVisibleResource % PAGE_SIZE)) / PAGE_SIZE;
      const lastVisiblePage = Math.max(0, lastVisibleResource - (lastVisibleResource % PAGE_SIZE)) / PAGE_SIZE;
      // console.info(`VISIBLE PAGES FROM ${firstVisiblePage} to ${lastVisiblePage}`);

      const pagesToCheck = Array.from(
        { length: lastVisiblePage - firstVisiblePage + 1 },
        (x, i) => (i + firstVisiblePage) * PAGE_SIZE,
      );
      // console.info(`PAGES TO CHECK : ${pagesToCheck.join(' – ')}`);

      for (const page of pagesToCheck) {
        let mustFetch: boolean = false;
        for (let i = page; i < page + PAGE_SIZE; ++i) {
          if (folderContentRef.current.items[i + folderContentRef.current.nbFolders] === null) {
            mustFetch = true;
            break;
          }
        }

        if (mustFetch && !fetchingPages.current.has(page)) {
          fetchingPages.current.add(page);
          loadPage(page).then(() => {
            fetchingPages.current.delete(page);
          });
        }
      }
    },
    [loadPage],
  );

  const loadContent: ContentLoaderProps['loadContent'] = React.useCallback(() => loadPage(0, true), [loadPage]);

  const onPressFolder = React.useCallback<NonNullable<ResourceGridTypes.Props<(typeof content.items)[0]>['onPressFolder']>>(
    f => navigation.push(route.name, { folderId: f.id }),
    [navigation, route.name],
  );

  const renderContent: ContentLoaderProps['renderContent'] = React.useCallback(
    refreshControl => {
      return (
        <ResourceGrid
          key="data"
          moduleConfig={moduleConfig}
          data={content.items}
          estimatedListSize={estimatedListSize}
          refreshControl={refreshControl}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          onPressFolder={onPressFolder}
          onPressResource={onOpenResource}
          ListEmptyComponent={emptyComponent ?? EmptyContentScreen}
        />
      );
    },
    [moduleConfig, content.items, onViewableItemsChanged, onPressFolder, onOpenResource, emptyComponent],
  );

  const renderLoading: ContentLoaderProps['renderLoading'] = React.useCallback(
    () => (
      <ResourceGrid
        key="placeholder"
        moduleConfig={moduleConfig}
        data={placeholderData}
        estimatedListSize={estimatedListSize}
        scrollEnabled={false}
      />
    ),
    [moduleConfig],
  );

  return (
    <PageView>
      <ContentLoader loadContent={loadContent} renderContent={renderContent} renderLoading={renderLoading} />
    </PageView>
  );
}

export default ResourceExplorerTemplate;
