import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { ITimelineNotificationProps } from './types';

import { UI_STYLES } from '~/framework/components/constants';
import { SmallItalicText, SmallText } from '~/framework/components/text';
import NotificationTopInfo from '~/framework/modules/timeline/components/notification-top-info';
import { renderMoodPicture } from '~/framework/modules/user/screens/profile/edit-moodmotto';
import appConf from '~/framework/util/appConf';
import { renderMediaPreview } from '~/framework/util/htmlParser/content';
import { Image } from '~/framework/util/media';
import { getAsEnrichedNotification, getAsResourceUriNotification } from '~/framework/util/notifications';
import { ArticleContainer } from '~/ui/ContainerContent';

export function TimelineNotification(props: ITimelineNotificationProps) {
  const { notification, notificationAction } = props;

  const renderMoodNotif = React.useMemo(() => {
    const degre = appConf.is1d ? '1d' : '2d';
    return (
      <View style={styles.notifMood}>
        <View style={styles.flex1}>
          <NotificationTopInfo notification={notification} />
        </View>
        <Image source={renderMoodPicture[degre][notification.backupData.params.moodImg]} style={styles.moodPicture} />
      </View>
    );
    // Since notifications are immutable, we can memoize them only by id safely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification.id]);

  const renderNotif = React.useMemo(() => {
    const preview = notification && getAsEnrichedNotification(notification)?.preview;
    const media = preview && preview.media;
    const text = preview && preview.text;
    const uri = notification && getAsResourceUriNotification(notification)?.resource.uri;

    return (
      <>
        <NotificationTopInfo notification={notification} />
        {notification.type === 'USERBOOK_MOTTO' ? (
          <SmallItalicText
            style={[styles.motto, styles.contentNotif]}>{`"${notification.backupData.params.motto}"`}</SmallItalicText>
        ) : null}
        {text && /\S/.test(text) ? (
          <SmallText key={notification.id} style={styles.contentNotif}>
            {text}
          </SmallText>
        ) : null}
        {media ? <View style={styles.contentNotif}>{renderMediaPreview(media, uri)}</View> : null}
      </>
    );
    // Since notifications are immutable, we can memoize them only by id safely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification.id]);

  return React.useMemo(() => {
    const CC = notificationAction ? TouchableOpacity : View;
    return (
      <ArticleContainer>
        <CC
          onPress={notificationAction}
          style={[styles.notif, UI_STYLES.width100]}
          {...(props.testID ? { testID: props.testID } : {})}>
          {notification.type === 'USERBOOK_MOOD' ? renderMoodNotif : renderNotif}
        </CC>
      </ArticleContainer>
    );
    // Since notifications are immutable, we can memoize them only by id safely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification.id]);
}
