import * as React from "react";
import { Text, Image, ImageURISource } from "react-native";

import { TouchCard } from "../../../../ui/Card";
import { ArticleContainer } from "../../../../ui/ContainerContent";
import Images from "../../../../ui/Images";
import NotificationTopInfo from "./NotificationTopInfo";
import Player from "../../../../ui/Player";
import { IFrame } from "../../../../ui/IFrame";
import { INotification, IMedia } from "../reducer/notifications";
import { AttachmentGroup } from "../../../../ui/AttachmentGroup";
import { IRemoteAttachment } from "../../../../ui/Attachment";
import { Icon } from "../../../../ui/icons/Icon";
import { signURISource, transformedSrc } from "../../../../infra/oauth";
import theme from "../../../theme";

interface ITimelineNotificationProps {
  notification: INotification;
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

  renderPreviewMedia(preview) {
    const { media } = preview;
    const firstMedia = media && media[0];
    if (firstMedia) {
      if (firstMedia.type === "attachment") {
        let mediaAttachments: IMedia[] = [];
        for (const mediaItem of media) {
          if (mediaAttachments.length === 4 || mediaItem.type !== "attachment") break;
          mediaAttachments.push(mediaItem);
        }
        const attachments = mediaAttachments.map(mediaAtt => ({url: transformedSrc(mediaAtt.src as string), displayName: mediaAtt.name}));
        return <AttachmentGroup attachments={attachments as Array<IRemoteAttachment>} containerStyle={{ flex: 1 }}/>
      } else if (firstMedia.type === "image") {
        let images: IMedia[] = [];
        for (const mediaItem of media) {
          if (mediaItem.type !== "image") break;
          images.push(mediaItem);
        }
        const imageSrcs = images.map(image => ({src: signURISource(transformedSrc(image.src as string))}));
        return <Images images={imageSrcs}/>
      } else if (firstMedia.type === "video" || firstMedia.type === "audio") {
        return (
          <Player
            type={firstMedia.type}
            source={signURISource(transformedSrc(firstMedia.src))}
            posterSource={firstMedia.posterSource ? signURISource(transformedSrc(firstMedia.posterSource as string)) : undefined}
            ratio={firstMedia.ratio}
          />
        )
      } else if (firstMedia.type === "iframe") {
        return <IFrame source={firstMedia.src as string} />
      }
    }
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
        >
          <NotificationTopInfo notification={notification} />
          {this.renderContent()}
          {notificationAction
            ? <Icon
                name="arrow_down"
                color={theme.color.secondary.regular}
                style={{ position: "absolute", right: 10, top: 10, transform: [{ rotate: "270deg" }]}}
              />
            : null
          }
        </TouchCard>
      </ArticleContainer>
    );
  }
}
