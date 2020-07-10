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
        return (
          <TouchableOpacity activeOpacity={1}>
            <IFrame source={firstItem.src as string} />
          </TouchableOpacity>
        )
      }
    }
  }

  public render() {
    const { message } = this.props;

    return (
      <ArticleContainer style={{ width: "100%" }}>
        <TouchCard onPress={() => this.open(false)} style={{ width: "100%" }}>
          <View>
            <NewsTopInfo {...this.props} />
            {message && /\S/.test(message) ?
              <Text style={{ color: CommonStyles.textColor }}>
                {message}
              </Text>
              : null
            }
            {this.getMediaPreview()}
          </View>
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
        </TouchCard>
      </ArticleContainer>
    );
  }
}
