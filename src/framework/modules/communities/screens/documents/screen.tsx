import * as React from 'react';

import {
  CommunityClient,
  FolderClient,
  FolderDto,
  getResourceUrl,
  MembershipClient,
  ResourceClient,
  ResourceDto,
  ResourceType,
} from '@edifice.io/community-client-rest-rn';
import { Temporal } from '@js-temporal/polyfill';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { PlaceholderLine } from 'rn-placeholder';

import { DecoratedDocumentFlatList } from './community-paginated-document-list';
import styles from './styles';
import type { CommunitiesDocumentItem, CommunitiesDocumentsScreen } from './types';
import { useCommunityBannerHeight } from '../../hooks/use-community-navbar/community-navbar/component';

import { I18n } from '~/app/i18n';
import { EntAppName, INTENT_TYPE, openIntent } from '~/app/intents';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { DocumentItemEntApp, DocumentItemWorkspace, FolderItem } from '~/framework/components/list/paginated-document-list/types';
import { LOADING_ITEM_DATA, staleOrSplice } from '~/framework/components/list/paginated-list';
import { sessionScreen } from '~/framework/components/screen';
import { HeadingXSText } from '~/framework/components/text';
import useCommunityScrollableThumbnail, { communityNavBar } from '~/framework/modules/communities/hooks/use-community-navbar';
import moduleConfig from '~/framework/modules/communities/module-config';
import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { communitiesActions, communitiesSelectors } from '~/framework/modules/communities/store';
import { openDocument as openMedia } from '~/framework/util/fileHandler/actions.ts';
import { toURISource } from '~/framework/util/media';
import { IMedia } from '~/framework/util/media-deprecated';
import { accountApi } from '~/framework/util/transport';

export const computeNavBar = (
  props: NativeStackScreenProps<CommunitiesNavigationParams, typeof communitiesRouteNames.documents>,
): NativeStackNavigationOptions => communityNavBar(props);

const documentTypeMap: Record<ResourceType, DocumentItemWorkspace<number>['type'] | undefined> = {
  [ResourceType.IMAGE]: 'image',
  [ResourceType.SOUND]: 'audio',
  [ResourceType.VIDEO]: 'video',
  [ResourceType.EXTERNAL_LINK]: 'link',
  [ResourceType.FILE]: 'document',
  [ResourceType.ENT]: undefined,
};

const formatDocuments = (data: ResourceDto[]): CommunitiesDocumentItem[] =>
  data.map(({ type, ...item }) =>
    item.appName === 'workspace'
      ? ({
          ...item,
          date: Temporal.Instant.from(item.updatedAt as unknown as string),
          extension: item.title.includes('.') ? item.title.split('.').at(-1) : undefined,
          type: documentTypeMap[type],
        } as DocumentItemWorkspace<number>)
      : ({
          ...item,
          date: Temporal.Instant.from(item.updatedAt as unknown as string),
        } as Exclude<DocumentItemEntApp<ResourceDto['appName'], number>, 'workspace'>),
  );

export default sessionScreen<CommunitiesDocumentsScreen.AllProps>(function CommunitiesDocumentsScreen({
  navigation,
  route: {
    params: { communityId, folderId },
  },
  route,
  session,
}) {
  const formatFolders = (data: FolderDto[]): FolderItem<number>[] => data.map(({ id, name }) => ({ id, title: name }));
  const communityData = useSelector(communitiesSelectors.getCommunityDetails(communityId));
  const dispatch = useDispatch();
  const setCommunityData = React.useCallback(
    (newData: Parameters<typeof communitiesActions.loadCommunityDetails>[1]) =>
      dispatch(communitiesActions.loadCommunityDetails(communityId, newData)),
    [dispatch, communityId],
  );

  // Store the data of the list here. It will contain both loaded and non-loaded elements.
  // `LOADING_ITEM_DATA` is a Symbol that reprensent non-loaded elements present in the list.
  const [data, setData] = React.useState<{
    folders: (FolderItem<number> | typeof LOADING_ITEM_DATA)[];
    documents: (CommunitiesDocumentItem | typeof LOADING_ITEM_DATA)[];
  }>({ documents: [], folders: [] });

  // Page size is a constant. Even if PaginatedList allows non-constant page size, it **should** be constant.
  // Its value needs to be sufficient to fill the entire screen without the need for scrolling.
  const PAGE_SIZE = 48;

  // This function fetch the data page the given page number and insert the resulting elements in the `data` array.
  const loadData = React.useCallback(
    async (page: number, reloadAll?: boolean) => {
      const [community, members, newData, folders] = await Promise.all([
        accountApi(session, moduleConfig, CommunityClient).getCommunity(communityId),
        accountApi(session, moduleConfig, MembershipClient).getMembers(communityId, { page: 1, size: 16 }),
        accountApi(session, moduleConfig, ResourceClient).getResources(communityId, { folderId, page: page + 1, size: PAGE_SIZE }),
        accountApi(session, moduleConfig, FolderClient)
          .getFolders(communityId, { page: 1, parentId: folderId, rootOnly: folderId === undefined, size: 256 })
          .then(dto => formatFolders(dto.items)),
      ]);
      setCommunityData({
        ...community,
        membersId: members.items.map(item => item.user.entId),
        totalMembers: members.meta.totalItems,
      });
      setData(prevData => {
        // The merge logic is contained in `staleOrSplice`. It inserts the new elements at the right place in `prevData`.
        // If `total` changes, there's a risk that the prevData is outdated, and should be flushed before inserting the new elements.
        // The resulting array will have a number of elements equals to `total`, that can be either loaded elements (ResourceDto) or non-loaded elements (LOADING_ITEM_DATA).
        // Old data is considered immutable, so `mergedData` is a brand-new array.
        const mergedData = staleOrSplice({
          newData: formatDocuments(newData.items),
          previousData: prevData.documents,
          reloadAll,
          start: page * PAGE_SIZE,
          total: newData.meta.totalItems,
        });
        return { documents: mergedData, folders };
      });
    },
    [communityId, folderId, session, setCommunityData],
  );

  const openDocument = React.useCallback(async (doc: CommunitiesDocumentItem) => {
    const url = getResourceUrl(doc); // ToDo : patch package to narrow type required
    if (!url) return;
    const openInBrowser = () => openIntent(doc.appName as EntAppName, INTENT_TYPE.OPEN_RESOURCE, { id: doc.resourceEntId, url });
    if (doc.appName === 'workspace') {
      const opener = {
        src: url,
        type: doc.type,
      } as IMedia;
      await openMedia(opener, openInBrowser);
    } else {
      openInBrowser();
    }
  }, []);

  const openFolder = React.useCallback(
    async (folder: FolderItem<number>) => {
      navigation.push(route.name, { communityId, folderId: folder.id });
    },
    [communityId, navigation, route.name],
  );

  const image = React.useMemo(
    () =>
      communityData.mobileThumbnails?.length
        ? communityData.mobileThumbnails.map(src => ({ ...src, height: 130, width: 440 }))
        : [toURISource(communityData.image!)],
    [communityData],
  );

  const [scrollElements, statusBar, { ...scrollViewProps }, placeholderBanner] = useCommunityScrollableThumbnail({
    contentContainerStyle: styles.list,
    image,
    title: I18n.get('communities-documents-title'),
  });

  const stickyPlaceholderElements = React.useMemo(
    () => [placeholderBanner, <PlaceholderLine width={60} noMargin style={styles.titlePlaceholder} />],
    [placeholderBanner],
  );

  const stickyElements = React.useMemo(
    () => [
      ...scrollElements,
      <HeadingXSText key="title" style={styles.title}>
        {I18n.get('communities-documents-title')}
      </HeadingXSText>,
    ],
    [scrollElements],
  );

  return (
    <>
      {statusBar}
      <DecoratedDocumentFlatList
        numColumns={2}
        pageSize={PAGE_SIZE}
        decorations={stickyElements}
        placeholderDecorations={stickyPlaceholderElements}
        folders={data.folders}
        documents={data.documents}
        placeholderNumberOfRows={3}
        showsVerticalScrollIndicator={false}
        onPageReached={loadData}
        onPressDocument={openDocument}
        onPressFolder={openFolder}
        ListEmptyComponent={
          <EmptyScreen
            svgImage="empty-workspace"
            title={I18n.get('communities-documents-empty-title')}
            text={I18n.get('communities-documents-empty-text')}
            customStyle={styles.emptyScreen}
          />
        }
        {...scrollViewProps}
      />
    </>
  );
});
