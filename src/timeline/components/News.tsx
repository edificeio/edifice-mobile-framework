import * as React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import I18n from "i18n-js";

import { CommonStyles } from "../../styles/common/styles";
import { TouchCard } from "../../ui/Card";
import { ArticleContainer } from "../../ui/ContainerContent";
import Images from "../../ui/Images";
import { A } from "../../ui/Typography";
import NewsTopInfo from "./NewsTopInfo";
import { Icon } from "../../ui/icons/Icon";
import Player from "../../ui/Player";
import { IFrame } from "../../ui/IFrame";
import { INewsModel, IMediaModel } from "../reducer";

interface INewsProps extends INewsModel {
  onPress?: (expend?: boolean) => void;
  index: number;
}

interface INewsState {
  full?: boolean;
}

export class News extends React.PureComponent<INewsProps, INewsState> {
  state = {
    full: false
  };

  open(expand: boolean) {
    const { onPress } = this.props;
    onPress && onPress(expand);
  }

  getMediaPreview() {
    const { message, media } = this.props;
    const firstItem = media[0];

    if (firstItem) {
      if (firstItem.type === "image") {
        let images: IMediaModel[] = [];
        for (const mediaItem of media) {
          if (mediaItem.type !== "image") break;
          images.push(mediaItem);
        }
        const imageSrcs = images.map(image => image.src);
        return (
          <Images
            images={imageSrcs as any} // TODO: `images` has not the right array object format
            style={message ? { marginTop: 15 } : {}}
          />
        )
      } else if (firstItem.type === "video" || firstItem.type === "audio") {
        return <Player type={firstItem.type} source={firstItem.src as string}/>
      } else if (firstItem.type === "iframe") {
        return <IFrame source={firstItem.src as string} />
      }
    }
  }

  public render() {
    const { message, media } = this.props;
    const firstItem = media[0];
    const hasAdditionalContent = () => {
      if (message && message.endsWith("...")) { // the message is too long and is cropped
        return true;
      } if (firstItem) {
          if (firstItem.type === "image") {
            let imageCount = 0;
            for (const mediaItem of media) {
              if (mediaItem.type !== "image") { // even if the first batch of images has less than 4 images, there might be additional medias
                return true;
              }
              imageCount++;
            }
            return imageCount > 4; // if there are only images, the first 4 are displayed
          } else return media.length > 1; // if the first item is a video/audio/iframe, additional items aren't displayed
      } else return false; // no additional text & no media
    }

    return (
      <ArticleContainer style={{ width: "100%" }}>
        <TouchCard onPress={() => this.open(false)} style={{ width: "100%" }}>
          <View>
            <NewsTopInfo {...this.props} />
            {message && /\S/.test(message)
            ? <Text style={{ color: CommonStyles.textColor, marginBottom: firstItem ? 10 : undefined }}>
                {message}
              </Text>
              : null
            }
            {this.getMediaPreview()}
          </View>
          {hasAdditionalContent()
            ? <>
                <View
                  style={{
                    marginVertical: 10,
                    marginHorizontal: -16,
                    height: 0.5,
                    backgroundColor: CommonStyles.grey,
                  }}
                />
                <TouchableOpacity
                  style={{ flexDirection: "row", alignSelf: "center" }}
                  onPress={() => this.open(true)}
                >
                  <A style={{ marginRight: 10 }}>
                    {I18n.t("seeMore")}
                  </A>
                  <Icon
                    name="arrow_down"
                    color={CommonStyles.actionColor}
                    style={{transform: [{ rotate: "270deg" }]}}
                  />
                </TouchableOpacity>
              </>
            : null
          }
        </TouchCard>
      </ArticleContainer>
    );
  }
}
