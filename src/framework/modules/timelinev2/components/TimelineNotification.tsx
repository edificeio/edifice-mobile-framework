import * as React from 'react';
import { Text } from 'react-native';

import NotificationTopInfo from './NotificationTopInfo';

import theme from '~/app/theme';
import { ResourceCard, TouchableResourceCard, TouchCard } from '~/framework/components/card';
import { ITimelineNotification, IMedia } from '~/framework/util/notifications';
import { signURISource, transformedSrc } from '~/infra/oauth';
import { IRemoteAttachment } from '~/ui/Attachment';
import { AttachmentGroup } from '~/ui/AttachmentGroup';
import { ArticleContainer } from '~/ui/ContainerContent';
import { IFrame } from '~/ui/IFrame';
import Images from '~/ui/Images';
import Player from '~/ui/Player';

interface ITimelineNotificationProps {
  notification: ITimelineNotification;
  notificationAction?: () => void;
}

export class TimelineNotification extends React.PureComponent<ITimelineNotificationProps> {
  renderPreviewText(preview) {
    const { text, media } = preview;
    const firstMedia = media && media[0];
    if (text && /\S/.test(text)) {
      return <Text style={{ color: theme.color.text.regular, marginBottom: firstMedia ? 10 : undefined }}>{text}</Text>;
    }
  }

  renderPreviewAttachements(media) {
    let mediaAttachments: IMedia[] = [];
    for (const mediaItem of media) {
      if (mediaAttachments.length === 4 || mediaItem.type !== 'attachment') break;
      mediaAttachments.push(mediaItem);
    }
    const attachments = mediaAttachments.map(mediaAtt => ({
      url: transformedSrc(mediaAtt.src as string),
      displayName: mediaAtt.name,
    }));
    return <AttachmentGroup attachments={attachments as Array<IRemoteAttachment>} containerStyle={{ flex: 1 }} />;
  }

  renderPreviewAudioVideo(media) {
    return (
      <Player
        type={media.type}
        source={signURISource(transformedSrc(media.src))}
        posterSource={media.posterSource ? signURISource(transformedSrc(media.posterSource as string)) : undefined}
        ratio={media.ratio}
      />
    );
  }

  renderPreviewIframe(media) {
    return <IFrame source={media.src as string} />;
  }

  renderPreviewImage(media) {
    let images: IMedia[] = [];
    for (const mediaItem of media) {
      if (mediaItem.type !== 'image') break;
      images.push(mediaItem);
    }
    const imageSrcs = images.map(image => ({ src: signURISource(transformedSrc(image.src as string)) }));
    return <Images images={imageSrcs} />;
  }

  renderPreviewMedia(preview) {
    const { media } = preview;
    const firstMedia = media && media[0];
    const components = {
      attachment: () => this.renderPreviewAttachements(media),
      audio: () => this.renderPreviewAudioVideo(firstMedia),
      iframe: () => this.renderPreviewIframe(firstMedia),
      image: () => this.renderPreviewImage(media),
      video: () => this.renderPreviewAudioVideo(firstMedia),
    };
    return firstMedia && components[firstMedia.type]?.();
  }

  renderContent() {
    const { notification } = this.props;
    const preview = notification && notification.preview;
    if (preview) {
      return (
        <>
          {this.renderPreviewText(preview)}
          {this.renderPreviewMedia(preview)}
        </>
      );
    }
    // } else if (mood) {
    //   return (
    //     <Image
    //       source={{uri: mood}}
    //       style={{width: 50, height: 50, alignSelf: "center"}}
    //     />
    //   )
    // } else if (motto) {
    //   return (
    //     <Text style={{ alignSelf: "center", fontStyle: "italic", color: theme.color.text.light}}>
    //       {`"${motto}"`}
    //     </Text>
    //   )
    // }
  }

  public render() {
    const { notification, notificationAction } = this.props;
    const CC = notificationAction ? TouchableResourceCard : ResourceCard;
    return (
      <ArticleContainer>
        <CC onPress={notificationAction} style={{ width: '100%' }} header={<NotificationTopInfo notification={notification} />}>
          {this.renderContent()}
        </CC>
      </ArticleContainer>
    );
  }
}
