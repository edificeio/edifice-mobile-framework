import * as React from 'react';
import { PixelRatio } from 'react-native';

import {
  CommunityClient,
  MembershipClient,
  ResourceClient,
  ResourceDto,
  ResourceType,
  utils,
} from '@edifice.io/community-client-rest-rn';
import { Temporal } from '@js-temporal/polyfill';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';

import CommunityPaginatedDocumentList from './community-paginated-document-list';
import styles from './styles';
import type { CommunitiesDocumentItem, CommunitiesDocumentsScreen } from './types';
import useCommunityScrollableThumbnail, { communityNavBar } from '../../hooks/use-community-navbar';
import { communitiesActions, communitiesSelectors } from '../../store';

import { I18n } from '~/app/i18n';
import { EntAppName, INTENT_TYPE, openIntent } from '~/app/intents';
import { UI_SIZES } from '~/framework/components/constants';
import FlatList from '~/framework/components/list/flat-list';
import { DocumentItemEntApp, DocumentItemWorkspace, FolderItem } from '~/framework/components/list/paginated-document-list/types';
import { LOADING_ITEM_DATA, staleOrSplice } from '~/framework/components/list/paginated-list';
import { sessionScreen } from '~/framework/components/screen';
import { HeadingXSText, TextSizeStyle } from '~/framework/components/text';
import moduleConfig from '~/framework/modules/communities/module-config';
import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { openDocument as openMedia } from '~/framework/util/fileHandler/actions.ts';
import http from '~/framework/util/http';
import { IMedia } from '~/framework/util/media';

export const computeNavBar = (
  props: NativeStackScreenProps<CommunitiesNavigationParams, typeof communitiesRouteNames.documents>,
): NativeStackNavigationOptions => communityNavBar(props);

const __debug__folders__: FolderItem[] = [
  // {
  //   id: 1,
  //   title: 'F1',
  // },
  // {
  //   id: 2,
  //   title: 'F2',
  // },
  // {
  //   id: 3,
  //   title: 'F3',
  // },
  // {
  //   id: 4,
  //   title: 'F4',
  // },
];

const documentTypeMap: Record<ResourceType, DocumentItemWorkspace['type'] | undefined> = {
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
        } as DocumentItemWorkspace)
      : ({
          ...item,
          date: Temporal.Instant.from(item.updatedAt as unknown as string),
        } as Exclude<DocumentItemEntApp<ResourceDto['appName']>, 'workspace'>),
  );

export default sessionScreen<CommunitiesDocumentsScreen.AllProps>(function CommunitiesDocumentsScreen({
  route: {
    params: { communityId },
  },
  session,
}) {
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
    folders: (FolderItem | typeof LOADING_ITEM_DATA)[];
    documents: (CommunitiesDocumentItem | typeof LOADING_ITEM_DATA)[];
  }>({ documents: [], folders: [] });

  // Page size is a constant. Even if PaginatedList allows non-constant page size, it **should** be constant.
  // Its value needs to be sufficient to fill the entire screen without the need for scrolling.
  const PAGE_SIZE = 48;

  // This function fetch the data page the given page number and insert the resulting elements in the `data` array.
  const loadData = React.useCallback(
    async (page: number, reloadAll?: boolean) => {
      const [community, members, newData] = await Promise.all([
        http.api(moduleConfig, session, CommunityClient).getCommunity(communityId),
        http.api(moduleConfig, session, MembershipClient).getMembers(communityId, { page: 1, size: 16 }),
        http.api(moduleConfig, session, ResourceClient).getResources(communityId, { page: page + 1, size: PAGE_SIZE }),
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
        const mergedData = staleOrSplice(
          prevData.documents,
          {
            from: page * PAGE_SIZE,
            items: formatDocuments(newData.items),
            total: newData.meta.totalItems,
          },
          reloadAll,
        );
        return { documents: mergedData, folders: __debug__folders__ };
      });
    },
    [communityId, session, setCommunityData],
  );

  // For perforance purpose, estimatedListSize must be the dimensions of the container (here the screen sithout, navBar and tabBar)
  const estimatedListSize = React.useMemo(
    () => ({
      height:
        UI_SIZES.screen.height - UI_SIZES.elements.navbarHeight - UI_SIZES.elements.tabbarHeight - UI_SIZES.screen.bottomInset,
      width: UI_SIZES.screen.width,
    }),
    [],
  );

  // For perforance purpose, estimatedItemSize must be the height of each element.
  // Don't forget to use style values and text sizes (including Pixel Ratio !) to compute that.
  // It **not** need to be pixel-perfect, but find a value that is close to reality.
  const estimatedItemSize = React.useMemo(
    () => TextSizeStyle.Medium.lineHeight * 2 * PixelRatio.getFontScale() + 2 * (styles.item.borderWidth + styles.item.padding),
    [],
  );

  const openDocument = React.useCallback(async (doc: CommunitiesDocumentItem) => {
    const url = utils.getResourceUrl(doc as Parameters<typeof utils.getResourceUrl>[0]);
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

  const [scrollElements, statusBar, { ...scrollViewProps }] = useCommunityScrollableThumbnail({
    // contentContainerStyle: styles.list,
    image: communityData.image,
    title: I18n.get('communities-documents-title'),
  });

  return (
    <>
      {statusBar}
      <CommunityPaginatedDocumentList
        // contentContainerStyle={styles.list}
        estimatedListSize={estimatedListSize}
        estimatedItemSize={estimatedItemSize}
        numColumns={2}
        pageSize={PAGE_SIZE}
        stickyElements={[
          ...scrollElements,
          <HeadingXSText key="title" style={styles.title}>
            {I18n.get('communities-documents-title')}
          </HeadingXSText>,
        ]}
        folders={data.folders}
        documents={data.documents}
        ListComponent={FlatList}
        showsVerticalScrollIndicator={false}
        onPageReached={loadData}
        onPressDocument={openDocument}
        {...scrollViewProps}
      />
    </>
  );
});
