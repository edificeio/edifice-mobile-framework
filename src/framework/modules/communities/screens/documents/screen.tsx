import * as React from 'react';
import { PixelRatio, View } from 'react-native';

import { ResourceClient, ResourceDto } from '@edifice.io/community-client-rest-rn';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';
import type { CommunitiesDocumentsScreen } from './types';
import moduleConfig from '../../module-config';

import { I18n } from '~/app/i18n';
import { UI_SIZES } from '~/framework/components/constants';
import PaginatedList, { LOADING_ITEM_DATA, PaginatedListProps, staleOrSplice } from '~/framework/components/list/paginated-list';
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
  const [data, setData] = React.useState<(ResourceDto | typeof LOADING_ITEM_DATA)[]>([]);

  const PAGE_SIZE = 48;

  const loadData = React.useCallback(
    async (page: number, reloadAll?: boolean) => {
      // await new Promise(resolve => setTimeout(resolve, 2000));
      const newData = await http
        .sessionApi(moduleConfig, ResourceClient)
        .getResources(route.params.communityId, { page: page + 1, size: PAGE_SIZE });
      setData(prevData => {
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

  const renderItem = React.useCallback<PaginatedListProps<ResourceDto>['renderItem']>(
    info => (
      <View style={styles.item}>
        <BodyBoldText numberOfLines={1}>
          {info.index} | {info.item.title}
        </BodyBoldText>
        <BodyText>{info.item.id}</BodyText>
      </View>
    ),
    [],
  );

  const renderPlaceholderItem = React.useCallback<PaginatedListProps<ResourceDto>['renderPlaceholderItem']>(
    () => (
      <View style={styles.item}>
        <BodyBoldText>(LOADING)</BodyBoldText>
        <BodyText>..........</BodyText>
      </View>
    ),
    [],
  );

  const estimatedListSize = React.useMemo(
    () => ({
      height:
        UI_SIZES.screen.height - UI_SIZES.elements.navbarHeight - UI_SIZES.elements.tabbarHeight - UI_SIZES.screen.bottomInset,
      width: UI_SIZES.screen.width,
    }),
    [],
  );

  const estimatedItemSize = React.useMemo(
    () => TextSizeStyle.Medium.lineHeight * 2 * PixelRatio.getFontScale() + 2 * (styles.item.borderWidth + styles.item.padding),
    [],
  );

  const keyExtractor = React.useCallback<NonNullable<PaginatedListProps<ResourceDto>['keyExtractor']>>(
    (item, index) => (item === LOADING_ITEM_DATA ? 'loading' + index.toString() : item + item.id.toString()),
    [],
  );

  return (
    <PaginatedList
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
