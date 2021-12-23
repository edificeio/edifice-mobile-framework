import * as React from 'react';
import { Text } from 'react-native';

import NotificationTopInfo from './NotificationTopInfo';
import theme from '~/app/theme';
import { ResourceCard, TouchableResourceCard } from '~/framework/components/card';
import { ITimelineNotification } from '~/framework/util/notifications';
import { ArticleContainer } from '~/ui/ContainerContent';
import { renderMediaPreview } from '~/framework/util/htmlParser/content';

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

    return (
      <ArticleContainer>
        <CC
          onPress={notificationAction}
          style={{ width: '100%' }}
          header={<NotificationTopInfo notification={notification} />}
        >
          {text && /\S/.test(text)
            ? <Text style={{ color: theme.color.text.regular, marginBottom: media?.length ? 10 : undefined }}>
                {text}
              </Text>
            : null
          }
          {media ? renderMediaPreview(media) : null}
        </CC>
      </ArticleContainer>
    );
  }
}
