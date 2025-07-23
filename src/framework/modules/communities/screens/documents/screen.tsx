import * as React from 'react';
import { PixelRatio, View } from 'react-native';

import { ResourceClient, ResourceDto } from '@edifice.io/community-client-rest-rn';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';
import type { CommunitiesDocumentsScreen } from './types';
import moduleConfig from '../../module-config';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import PaginatedList, { LOADING_ITEM_DATA, PaginatedListProps, staleOrSplice } from '~/framework/components/list/paginated-list';
import { Picture } from '~/framework/components/picture';
import { sessionScreen } from '~/framework/components/screen';
import { BodyBoldText, BodyText, TextSizeStyle } from '~/framework/components/text';
import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import http from '~/framework/util/http';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<CommunitiesNavigationParams, typeof communitiesRouteNames.documents>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('communities-documents-title'),
  }),
});

export default sessionScreen<CommunitiesDocumentsScreen.AllProps>(function CommunitiesDocumentsScreen({ route, session }) {
  // Store the data of the list here. It will contain both loaded and non-loaded elements.
  // `LOADING_ITEM_DATA` is a Symbol that reprensent non-loaded elements present in the list.
  const [data, setData] = React.useState<(ResourceDto | typeof LOADING_ITEM_DATA)[]>([]);

  // Page size is a constant. Even if PaginatedList allows non-constant page size, it **should** be constant.
  // Its value needs to be sufficient to fill the entire screen without the need for scrolling.
  const PAGE_SIZE = 48;

  // This function fetch the data page the given page number and insert the resulting elements in the `data` array.
  const loadData = React.useCallback(
    async (page: number, reloadAll?: boolean) => {
      // await new Promise(resolve => setTimeout(resolve, 2000));
      const newData = await http
        .sessionApi(moduleConfig, ResourceClient)
        .getResources(route.params.communityId, { page: page + 1, size: PAGE_SIZE });
      setData(prevData => {
        // The merge logic is contained in `staleOrSplice`. It inserts the new elements at the right place in `prevData`.
        // If `total` changes, there's a risk that the prevData is outdated, and should be flushed before inserting the new elements.
        // The resulting array will have a number of elements equals to `total`, that can be either loaded elements (ResourceDto) or non-loaded elements (LOADING_ITEM_DATA).
        // Old data is considered immutable, so `mergedData` is a brand-new array.
        const mergedData = staleOrSplice(
          prevData,
          { from: page * PAGE_SIZE, items: newData.items, total: newData.meta.totalItems },
          reloadAll,
        );
        return mergedData;
      });
    },
    [route.params.communityId],
  );

  // `renderItem` and `renderPlaceholderItem` must display elements of the same height.
  // If not, it won't be beautiful :'(
  const renderItem = React.useCallback<PaginatedListProps<ResourceDto>['renderItem']>(
    info => (
      <View style={[styles.item, { backgroundColor: theme.apps[info.item.appName]?.accentColors.pale }]}>
        <Picture
          {...theme.apps[info.item.appName]?.icon}
          fill={theme.apps[info.item.appName]?.accentColors.regular}
          width={UI_SIZES.dimensions.height.larger}
          height={UI_SIZES.dimensions.height.larger}
        />
        <View style={{ flex: 1 }}>
          <BodyBoldText numberOfLines={1}>
            {info.index} | {info.item.title}
          </BodyBoldText>
          <BodyText>{info.item.id}</BodyText>
        </View>
      </View>
    ),
    [],
  );

  const renderPlaceholderItem = React.useCallback<PaginatedListProps<ResourceDto>['renderPlaceholderItem']>(
    () => (
      <View style={styles.item}>
        <View style={{ flex: 1 }}>
          <BodyBoldText>(LOADING)</BodyBoldText>
          <BodyText>..........</BodyText>
        </View>
      </View>
    ),
    [],
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

  // Keep in mind that `keyExtractor` need to handle either loaded and non-loaded data to return the key value.
  // Use id for loaded values
  // Use index for non-loaded values. Add a prefix to be sure that cases where id === index won't be a problem.
  const keyExtractor = React.useCallback<NonNullable<PaginatedListProps<ResourceDto>['keyExtractor']>>(
    (item, index) => (item === LOADING_ITEM_DATA ? 'loading' + index.toString() : item + item.id.toString()),
    [],
  );

  return (
    <PaginatedList
      contentContainerStyle={styles.list}
      estimatedListSize={estimatedListSize}
      estimatedItemSize={estimatedItemSize}
      numColumns={2}
      renderItem={renderItem}
      renderPlaceholderItem={renderPlaceholderItem}
      pageSize={PAGE_SIZE}
      data={data}
      onPageReached={loadData}
      keyExtractor={keyExtractor}
    />
  );
});
