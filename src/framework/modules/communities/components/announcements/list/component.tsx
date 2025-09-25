import React from 'react';
import { ViewStyle } from 'react-native';

import styles from './styles';

import { I18n } from '~/app/i18n';
import { AnnouncementPostDetailsCard } from '~/framework/components/card/post/details';
import type { PostWithAudienceProps } from '~/framework/components/card/post/details/types';
import { EmptyContent } from '~/framework/components/empty-screens/base/component';
import { PaginatedFlashList, PaginatedFlashListProps } from '~/framework/components/list/paginated-list';
import { SmallText } from '~/framework/components/text';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { mockAnnouncements } from '~/framework/modules/communities/screens/home/screen';
import { ESTIMATED_LIST_SIZE, getItemSeparatorStyle } from '~/framework/modules/communities/utils';

interface AnnouncementListProps {
  announcements: typeof mockAnnouncements;
  session: AuthActiveAccount;
}

const PAGE_SIZE = 20;

const AnnouncementListItem = ({
  announcement,
  itemSeparatorStyle,
  session,
}: {
  announcement: (typeof mockAnnouncements)[0];
  session: AuthActiveAccount;
  itemSeparatorStyle?: ViewStyle;
}) => {
  return (
    <AnnouncementPostDetailsCard
      announcement={announcement}
      post={announcement}
      //   onReady={announcement.onReady}
      session={session}
      borderBottomStyle={itemSeparatorStyle}
    />
  );
};

const AnnouncementsList = ({ announcements, session }: Readonly<AnnouncementListProps>) => {
  const renderItem = React.useCallback(
    ({ index, item }: { index: number; item: (typeof mockAnnouncements)[0] }) => {
      const itemSeparator = getItemSeparatorStyle(index, announcements.length, styles.itemSeparator);

      return <AnnouncementListItem announcement={item} session={session!} itemSeparatorStyle={itemSeparator} />;
    },
    [announcements.length, session],
  );

  const keyExtractor = React.useCallback<NonNullable<PaginatedFlashListProps<PostWithAudienceProps>['keyExtractor']>>(
    item => item._id.toString(),
    [],
  );

  return (
    <PaginatedFlashList
      data={announcements}
      //   estimatedItemSize={ESTIMATED_ITEM_SIZE}
      estimatedListSize={ESTIMATED_LIST_SIZE}
      keyExtractor={keyExtractor}
      ListEmptyComponent={
        <EmptyContent
          extraStyle={styles.emptyContent}
          svg="empty-communities-announcements"
          text={I18n.get('communities-announcements-empty-text')}
          title={I18n.get('communities-announcements-empty-title')}
        />
      }
      pageSize={PAGE_SIZE}
      renderItem={renderItem}
      renderPlaceholderItem={() => <SmallText>{'loading.....'}</SmallText>}
      //   ListHeaderComponent={listHeaderComponent}
      //   ListFooterComponent={listFooterComponent}
      //   contentContainerStyle={styles.flexGrow1}
      //   onEndReached={onEndReached}
      //   onEndReachedThreshold={0.5}
      //   onPageReached={loadData}
    />
  );
};

export default AnnouncementsList;
