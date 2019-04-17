import I18n from "i18n-js";

import style from "glamorous-native";
import * as React from "react";
import { View } from "react-native";
import { INewsModel } from "../reducer";

import { TouchCard } from "../../ui/Card";
import { ArticleContainer } from "../../ui/ContainerContent";
import { Images } from "../../ui/Images";
import { Preview } from "../../ui/Preview";
import NewsTopInfo from "./NewsTopInfo";

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

  open(expend: boolean) {
    this.props.onPress(expend);
  }

  public render() {
    const {
      date,
      eventType,
      senderId,
      senderName,
      resourceName,
      message,
      type,
      images = []
    } = this.props;
    return (
      <ArticleContainer style={{ width: "100%" }}>
        <TouchCard onPress={() => this.open(false)} style={{ width: "100%" }}>
          <View>
            <NewsTopInfo {...this.props} />
            <Preview textContent={message} onExpend={() => this.open(true)} />
            {images.length ? (
              <Images
                images={images as any} // TODO: `images` has not the right array object format
                style={message ? { marginTop: 15 } : {}}
              />
            ) : (
              <View />
            )}
          </View>
        </TouchCard>
      </ArticleContainer>
    );
  }
}

const Margin = style.view({
  height: 10
});

const Image = style.image({
  height: 160,
  width: 350
});
