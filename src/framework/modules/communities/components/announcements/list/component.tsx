import React from 'react';
import { ViewProps } from 'react-native';

import styles from './styles';

import { I18n } from '~/app/i18n';
import { ContentCardHeader, ContentCardIcon } from '~/framework/components/card';
import PostDetails from '~/framework/components/card/post/details';
import type { PostDetailsProps } from '~/framework/components/card/post/details/types';
import { EmptyContent } from '~/framework/components/empty-screens/base/component';
import { PaginatedFlashList } from '~/framework/components/list/paginated-list';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { ESTIMATED_LIST_SIZE, getItemSeparatorStyle } from '~/framework/modules/communities/utils';

interface AnnouncementListProps {
  announcements: PostDetailsProps[];
}

const PAGE_SIZE = 20;

const PostHeader = ({ author, date }: Pick<PostDetailsProps, 'author' | 'date'>) => {
  const displayedDate = React.useMemo(() => (date ? I18n.date(date) : ''), [date]);

  return (
    <ContentCardHeader
      icon={<ContentCardIcon userIds={[author.userId || require('ASSETS/images/system-avatar.png')]} />}
      text={
        author.username ? (
          <SmallBoldText numberOfLines={1}>{`${I18n.get('common-by')} ${author.username}`}</SmallBoldText>
        ) : undefined
      }
      date={displayedDate}
    />
  );
};

const AnnouncementListItem = ({ announcement, style }: { announcement: PostDetailsProps; style?: ViewProps['style'] }) => {
  return (
    <PostDetails
      {...announcement}
      header={<PostHeader author={announcement.author} date={announcement.date} />}
      style={style}
      //   onReady={announcement.onReady}
    />
  );
};

const AnnouncementsList = ({ announcements }: Readonly<AnnouncementListProps>) => {
  const renderItem = React.useCallback(
    ({ index, item }: { index: number; item: PostDetailsProps }) => {
      const itemSeparator = getItemSeparatorStyle(index, announcements.length, styles.itemSeparator);
      const itemStyle = [styles.itemContainer, itemSeparator];

      return <AnnouncementListItem announcement={item} style={itemStyle} />;
    },
    [announcements.length],
  );

  //   const keyExtractor = React.useCallback<NonNullable<PaginatedFlashListProps<PostProps>['keyExtractor']>>(
  //     item => item.audience.referer.resourceId,
  //     [],
  //   );

  return (
    <PaginatedFlashList
      data={announcements}
      //   estimatedItemSize={ESTIMATED_ITEM_SIZE}
      estimatedListSize={ESTIMATED_LIST_SIZE}
      //   keyExtractor={keyExtractor}
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
    />
  );
};

export default AnnouncementsList;
