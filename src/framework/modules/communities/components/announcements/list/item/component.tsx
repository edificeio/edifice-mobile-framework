import React from 'react';
import { View } from 'react-native';

import styles from './styles';
import { AnnouncementListItemProps } from './types';

import { I18n } from '~/app/i18n';
import { SingleAvatar } from '~/framework/components/avatar';
import { UI_STYLES } from '~/framework/components/constants';
import { CaptionItalicText, SmallBoldText } from '~/framework/components/text';
import PostDetails from '~/framework/modules/communities/components/announcements/post/details';
import type { PostDetailsProps } from '~/framework/modules/communities/components/announcements/post/details/types';

const PostHeader = ({ author, date }: Readonly<Pick<PostDetailsProps, 'author' | 'date'>>) => {
  const displayedDate = React.useMemo(() => (date ? I18n.date(date) : ''), [date]);

  return (
    <View style={styles.container}>
      <SingleAvatar userId={author.userId} size="md" />
      <View style={styles.authorAndDate}>
        <SmallBoldText numberOfLines={1} style={UI_STYLES.flex1}>
          {author.username}
        </SmallBoldText>
        <View style={styles.separator} />
        <CaptionItalicText style={styles.date}>{displayedDate}</CaptionItalicText>
      </View>
    </View>
  );
};

const AnnouncementListItem = ({ announcement, style }: Readonly<AnnouncementListItemProps>) => {
  return (
    <PostDetails {...announcement} header={<PostHeader author={announcement.author} date={announcement.date} />} style={style} />
  );
};

export default AnnouncementListItem;
