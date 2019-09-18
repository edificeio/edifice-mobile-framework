import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import { TextStyle, View } from "react-native";
import { connect } from "react-redux";

import { CommonStyles } from "../../styles/common/styles";
import { Line } from "../../ui";
import { Size } from "../../ui/avatars/Avatar";
import { RowAvatars } from "../../ui/avatars/RowAvatars";
import { Back } from "../../ui/headers/Back";
import {
  CenterPanel,
  Header,
  Title,
  TouchableEndBarPanel
} from "../../ui/headers/Header";

import { Weight } from "../../ui/Typography";
import mailboxConfig from "../config";
import { IConversationThread } from "../reducers/threadList";
import { getSessionInfo } from "../../AppStore";

const legendStyle: TextStyle = {
  alignSelf: "center",
  color: "white",
  flexWrap: "nowrap"
};

const Legend14 = style.text({
  ...legendStyle,
  fontFamily: CommonStyles.primaryFontFamily,
  fontWeight: Weight.Bold,
  height: 45,
  marginBottom: 30,
  textAlign: "center",
  textAlignVertical: "center",
  width: "66%"
});

const Legend12 = style.text({
  ...legendStyle,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 11,
  fontWeight: Weight.Light,
  height: 18,
  marginBottom: 25
});

export const ContainerAvatars = style.view({
  alignItems: "center",
  flex: 1,
  height: 160,
  justifyContent: "flex-start"
});

export interface IThreadsBarProps {
  navigation?: any;
  thread: IConversationThread;
}

export class ThreadsTopBar extends React.PureComponent<IThreadsBarProps, {}> {
  public state = {
    expand: false,
    slideIndex: 0
  };

  public static expanded;

  private onPress() {
    ThreadsTopBar.expanded = !this.state.expand;
    this.setState({ expand: !this.state.expand });
  }

  private onSlideIndex(slideIndex) {
    this.setState({ slideIndex });
  }

  public render() {
    const { navigation } = this.props;
    const { displayNames, subject, to, from } = this.props.thread;
    let { cc } = this.props.thread;
    const { expand } = this.state;

    cc = cc || [];
    const imageSet = new Set(
      [...to, ...cc, from].filter(el => el !== getSessionInfo().userId)
    );
    if (imageSet.size === 0) {
      imageSet.add(getSessionInfo().userId);
    }
    const images = [...imageSet];
    // console.log("ThreadPageHeader displayNames", displayNames);
    // console.log("images", images);
    const names = images.map(el => {
      const u = displayNames.find(dn => dn[0] === el);
      return u ? u[1] : I18n.t("unknown-user");
    });

    return (
      <Header>
        <View
          style={{
            alignItems: "center",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center"
          }}
        >
          <Line>
            <Back navigation={navigation} />
            <CenterPanel
              onPress={() => this.onPress()}
              style={{ paddingTop: 5, paddingBottom: 5 }}
            >
              {!expand && <RowAvatars images={images} size={Size.small} />}
              <Title numberOfLines={1} smallSize={!expand}>
                {subject}
              </Title>
            </CenterPanel>
            <TouchableEndBarPanel />
          </Line>
          <Line>
            {expand ? (
              <ContainerAvatars>
                <RowAvatars
                  onSlideIndex={slideIndex => this.onSlideIndex(slideIndex)}
                  images={images}
                />
                <Legend14 numberOfLines={2}>
                  {names[this.state.slideIndex]}
                </Legend14>
              </ContainerAvatars>
            ) : (
              <View />
            )}
          </Line>
        </View>
      </Header>
    );
  }
}

export default connect(
  (state: any, props: any) => {
    const localState = state[mailboxConfig.reducerName].threadList;
    const selectedThreadId = state[mailboxConfig.reducerName].threadSelected;
    return {
      thread: localState.data.byId[selectedThreadId]
    };
  },
  dispatch => ({})
)(ThreadsTopBar);
