import * as React from 'react';

import { ResourceCard, TouchableResourceCard } from '~/framework/components/card';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
import { renderMediaPreview } from '~/framework/util/htmlParser/content';
import { ITimelineNotification, getAsEnrichedNotification } from '~/framework/util/notifications';
import { ArticleContainer } from '~/ui/ContainerContent';

import NotificationTopInfo from './notification-top-info';

interface ITimelineNotificationProps {
  notification: ITimelineNotification;
  notificationAction?: () => void;
}

export function TimelineNotification(props: ITimelineNotificationProps) {
  const { notification, notificationAction } = props;
  return React.useMemo(() => {
    const preview = notification && getAsEnrichedNotification(notification)?.preview;
    const media = preview && preview.media;
    const text = preview && preview.text;
    const CC = notificationAction ? TouchableResourceCard : ResourceCard;
    return (
      <ArticleContainer>
        <CC onPress={notificationAction} style={UI_STYLES.width100} header={<NotificationTopInfo notification={notification} />}>
          {text && /\S/.test(text) ? (
            <SmallText key={notification.id} style={{ marginBottom: media?.length ? UI_SIZES.spacing.small : undefined }}>
              {text}
            </SmallText>
          ) : null}
          {media ? renderMediaPreview(media) : null}
        </CC>
      </ArticleContainer>
    );
    // Since notifications are immutable, we can memoize them only by id safely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification.id]);
}
