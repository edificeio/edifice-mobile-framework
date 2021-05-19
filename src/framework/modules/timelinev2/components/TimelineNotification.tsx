import * as React from "react";
import { Text, View } from "react-native";

import { ArticleContainer } from "../../../../ui/ContainerContent";
import Images from "../../../../ui/Images";
import NotificationTopInfo from "./NotificationTopInfo";
import Player from "../../../../ui/Player";
import { IFrame } from "../../../../ui/IFrame";
import { ITimelineNotification, IMedia } from "../../../util/notifications";
import { AttachmentGroup } from "../../../../ui/AttachmentGroup";
import { IRemoteAttachment } from "../../../../ui/Attachment";
import { Icon } from "../../../../ui/icons/Icon";
import { signURISource, transformedSrc } from "../../../../infra/oauth";
import theme from "../../../util/theme";
import { TouchCard } from "../../../components/card";

interface ITimelineNotificationProps {
  notification: ITimelineNotification;
  notificationAction?: () => void;
}

export class TimelineNotification extends React.PureComponent<ITimelineNotificationProps> {
  renderPreviewText(preview) {
    const { text, media } = preview;
    const firstMedia = media && media[0];
    if (text && /\S/.test(text)) {
      return (
        <Text style={{ color: theme.color.text.regular, marginBottom: firstMedia ? 10 : undefined}}>
          {text}
        </Text>
      )
    }
  }

  renderPreviewAttachements(media) {
    let mediaAttachments: IMedia[] = [];
    for (const mediaItem of media) {
      if (mediaAttachments.length === 4 || mediaItem.type !== "attachment") break;
      mediaAttachments.push(mediaItem);
    }
    const attachments = mediaAttachments.map(mediaAtt => ({ url: transformedSrc(mediaAtt.src as string), displayName: mediaAtt.name }));
    return (
      <AttachmentGroup
        attachments={attachments as Array<IRemoteAttachment>}
        containerStyle={{ flex: 1 }}
      />
    )
  }

  renderPreviewAudioVideo(media) {
    return (
      <Player
        type={media.type}
        source={signURISource(transformedSrc(media.src))}
        posterSource={media.posterSource ? signURISource(transformedSrc(media.posterSource as string)) : undefined}
        ratio={media.ratio}
      />
    )
  }

  renderPreviewIframe(media) {
    return (
      <IFrame
        source={media.src as string}
      />
    )
  }

  renderPreviewImage(media) {
    let images: IMedia[] = [];
    for (const mediaItem of media) {
      if (mediaItem.type !== "image") break;
      images.push(mediaItem);
    }
    const imageSrcs = images.map(image => ({src: signURISource(transformedSrc(image.src as string))}));
    return <Images images={imageSrcs}/>
  }

  renderPreviewMedia(preview) {
    const { media } = preview;
    const firstMedia = media && media[0];
    const components = {
      "attachment": () => this.renderPreviewAttachements(media),
      "audio": () => this.renderPreviewAudioVideo(firstMedia),
      "iframe": () => this.renderPreviewIframe(firstMedia),
      "image": () => this.renderPreviewImage(media),
      "video": () => this.renderPreviewAudioVideo(firstMedia),
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
      )
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
    return (
      <ArticleContainer>
        <TouchCard
          activeOpacity={!notificationAction ? 1 : undefined}
          onPress={notificationAction}
          style={{width: "100%"}}
        >
          <View style={{ width: "100%", flexDirection: "row" }}>
            <NotificationTopInfo notification={notification}/>
            {notificationAction
              ? <Icon
                  name="arrow_right"
                  color={theme.color.secondary.regular}
                  style={{ marginTop: 7, right: 7 }}
                />
              : null
            }
          </View>
          {this.renderContent()}
        </TouchCard>
      </ArticleContainer>
    );
  }
}
