import style from "glamorous-native";
import * as React from "react";
import { View } from "react-native";
import { INewsModel } from "../reducer";
import {
  ArticleContainer,
  LeftPanel,
  Header,
  CenterPanel
} from "../../ui/ContainerContent";
import { TouchCard } from "../../ui/Card";
import { SingleAvatar } from "../../ui/avatars/SingleAvatar";
import { Bold, Light } from "../../ui/Typography";
import { DateView } from "../../ui/DateView";
import { Preview } from "../../ui/Preview";
import { Images } from "../../ui/Images";
import I18n from "react-native-i18n";

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
      senderId,
      senderName,
      resourceName,
      message,
      images = []
    } = this.props;
    return (
      <ArticleContainer>
        <TouchCard onPress={() => this.open(false)}>
          <Header>
            <LeftPanel>
              <SingleAvatar userId={senderId} />
            </LeftPanel>
            <CenterPanel>
              <Bold>
                {senderName}
                <Light> {I18n.t("On")} </Light>
                {resourceName}
              </Bold>
              <DateView date={date} short={false} />
            </CenterPanel>
          </Header>
          <Preview textContent={message} onExpend={() => this.open(true)} />
          {images.length ? (
            <Images
              images={images as any} // TODO: `images` has not the right array object format
              style={message ? { marginTop: 15 } : {}}
            />
          ) : (
            <View />
          )}
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
