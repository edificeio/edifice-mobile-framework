import * as React from 'react';
import { PixelRatio } from 'react-native';

import { MembershipClient, MembershipResponseDto, PaginationQueryDto } from '@edifice.io/community-client-rest-rn';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';
import type { CommunitiesMembersScreen } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import VisibleItem, { VisibleItemLoader } from '~/framework/components/card/visible-item';
import { VisibleItemProps } from '~/framework/components/card/visible-item/types';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/empty-screens';
import PaginatedList, { LOADING_ITEM_DATA, PaginatedListProps, staleOrSplice } from '~/framework/components/list/paginated-list';
import { sessionScreen } from '~/framework/components/screen';
import { TextSizeStyle } from '~/framework/components/text';
import { AccountType } from '~/framework/modules/auth/model';
import MemberListItem, { MemberListItemLoader } from '~/framework/modules/communities/components/member-list-item';
import MembersListCount, { MembersListCountLoader } from '~/framework/modules/communities/components/members-list-count';
import moduleConfig from '~/framework/modules/communities/module-config';
import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import http from '~/framework/util/http';

const ESTIMATED_ITEM_SIZE = TextSizeStyle.Normal.lineHeight * PixelRatio.getFontScale() * 2 + UI_SIZES.spacing.small * 2;
const ESTIMATED_LIST_SIZE = {
  height: UI_SIZES.getViewHeight(),
  width: UI_SIZES.screen.width,
};
const PAGE_SIZE = 100;

const isEven = (index: number): boolean => index % 2 === 0;
const getItemBackgroundColor = (index: number): VisibleItemProps['backgroundColor'] => {
  return isEven(index) ? undefined : theme.palette.grey.fog;
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<CommunitiesNavigationParams, typeof communitiesRouteNames.members>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('communities-members-title'),
  }),
});

export default sessionScreen<Readonly<CommunitiesMembersScreen.AllProps>>(function CommunitiesMembersScreen({ route }) {
  const [allMembers, setAllMembers] = React.useState<(MembershipResponseDto | typeof LOADING_ITEM_DATA)[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const communityId = route.params.communityId;

  const loadData = React.useCallback(
    async (page: number, reloadAll?: boolean) => {
      try {
        const baseQueryParams: PaginationQueryDto = {
          page: page + 1,
          size: PAGE_SIZE,
        };

        const members = await http.sessionApi(moduleConfig, MembershipClient).getMembers(Number(communityId), baseQueryParams);

        setAllMembers(prevData => {
          return staleOrSplice(
            prevData,
            { from: page * PAGE_SIZE, items: members.items, total: members.meta.totalItems },
            reloadAll,
          );
        });
      } catch (e) {
        console.error('Error while loading community members list', e);
      } finally {
        setIsLoading(false);
      }
    },
    [communityId],
  );

  React.useEffect(() => {
    loadData(0, true);
  }, [loadData]);

  const renderItem = React.useCallback(({ index, item }: { item: MembershipResponseDto; index: number }) => {
    if (!item.user) return null;
    const backgroundColor = getItemBackgroundColor(index);

    return (
      <VisibleItem
        backgroundColor={backgroundColor}
        avatarSize="md"
        key={item.user.entId}
        // rightElement={<ItemOptions />} // for next version
        userId={item.user.entId}>
        <MemberListItem name={item.user.displayName} profileType={item.user.profile as AccountType} role={item.role} />
      </VisibleItem>
    );
  }, []);

  const renderPlaceholderItem = React.useCallback(({ index }: { index: number }) => {
    const backgroundColor = getItemBackgroundColor(index);
    return (
      <VisibleItemLoader backgroundColor={backgroundColor}>
        <MemberListItemLoader />
      </VisibleItemLoader>
    );
  }, []);

  const keyExtractor = React.useCallback<NonNullable<PaginatedListProps<MembershipResponseDto>['keyExtractor']>>(
    (item, index) => (item === LOADING_ITEM_DATA ? 'loading' + index.toString() : item.user.entId.toString()),
    [],
  );

  const renderMembersCount = React.useCallback(() => {
    if (allMembers.length <= 1) return null;
    if (isLoading) return <MembersListCountLoader />;
    return <MembersListCount count={allMembers.length} />;
  }, [allMembers.length, isLoading]);

  return (
    <>
      {renderMembersCount()}
      <PaginatedList
        data={allMembers.length <= 1 ? [] : allMembers} // render empty screen if no members have been added yet by admin
        estimatedItemSize={ESTIMATED_ITEM_SIZE}
        estimatedListSize={ESTIMATED_LIST_SIZE}
        keyExtractor={keyExtractor}
        onPageReached={loadData}
        pageSize={PAGE_SIZE}
        renderItem={renderItem}
        renderPlaceholderItem={renderPlaceholderItem}
        scrollsToTop
        ListEmptyComponent={
          <EmptyScreen
            svgImage="empty-timeline"
            title={I18n.get('communities-members-list-empty-title')}
            text={I18n.get('communities-members-list-empty-text')}
            customStyle={styles.emptyScreen}
          />
        }
      />
    </>
  );
});
