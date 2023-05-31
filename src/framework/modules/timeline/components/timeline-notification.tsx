import * as React from 'react';

import { ResourceCard, TouchableResourceCard } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
import { renderMediaPreview } from '~/framework/util/htmlParser/content';
import { ITimelineNotification } from '~/framework/util/notifications';
import { ArticleContainer } from '~/ui/ContainerContent';

import NotificationTopInfo from './notification-top-info';

interface ITimelineNotificationProps {
  notification: ITimelineNotification;
  notificationAction?: () => void;
}

export class TimelineNotification extends React.PureComponent<ITimelineNotificationProps> {
  render() {
    const { notification, notificationAction } = this.props;
    const preview = notification && notification.preview;
    const media = preview && preview.media;
    const text = preview && preview.text;
    const CC = notificationAction ? TouchableResourceCard : ResourceCard;

    const content =
      text || media
        ? [
            text && /\S/.test(text) ? (
              <SmallText style={{ marginBottom: media?.length ? UI_SIZES.spacing.small : undefined }}>{text}</SmallText>
            ) : null,
            media ? renderMediaPreview(media) : null,
          ]
        : null;

    return (
      <ArticleContainer>
        <CC onPress={notificationAction} style={{ width: '100%' }} header={<NotificationTopInfo notification={notification} />}>
          {content}
        </CC>
      </ArticleContainer>
    );
  }
}
