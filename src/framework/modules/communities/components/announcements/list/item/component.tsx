import React from 'react';
import { View } from 'react-native';

import { AnnouncementType } from '@edifice.io/community-client-rest-rn';

import { I18n } from '~/app/i18n';
import { SingleAvatar } from '~/framework/components/avatar';
import { UI_STYLES } from '~/framework/components/constants';
import { CaptionItalicText, SmallBoldText } from '~/framework/components/text';
import CollectionItem from '~/framework/modules/communities/components/announcements/list/item/collection';
import PostDetails from '~/framework/modules/communities/components/announcements/post/details';
import type { AnnouncementDetails } from '~/framework/modules/communities/service/announcements';

import styles from './styles';
import { AnnouncementListItemProps } from './types';

const InfoHeader = ({ author, date }: Readonly<Pick<AnnouncementDetails<number>, 'author' | 'date'>>) => {
  const displayedDate = React.useMemo(() => (date ? I18n.date(date) : ''), [date]);

  return (
    <View style={styles.container}>
      <SingleAvatar userId={author.userId} size="sm" />
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

const AnnouncementListItem = ({ announcement, session, style, userRole }: Readonly<AnnouncementListItemProps>) => {
  if (announcement.type === AnnouncementType.COLLECT) {
    return <CollectionItem announcement={announcement} style={style} userRole={userRole} />;
  }

  return (
    <PostDetails
      {...announcement}
      header={<InfoHeader author={announcement.author} date={announcement.date} />}
      session={session}
      style={style}
    />
  );
};

export default AnnouncementListItem;
