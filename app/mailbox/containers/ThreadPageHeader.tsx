import style from "glamorous-native";
import * as React from "react";
import { TextStyle, View } from "react-native";
import { connect } from "react-redux";

import { setHeader } from "../../infra/actions/ui";
import { Me } from "../../infra/Me";

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

import mailboxConfig from "../config";
import { IConversationThread } from "../reducers/threadList";

const legendStyle: TextStyle = {
  alignSelf: "center",
  color: "white",
  flexWrap: "nowrap"
};

const Legend14 = style.text({
  ...legendStyle,
  fontFamily: CommonStyles.primaryFontFamilyBold,
  height: 45,
  marginBottom: 30,
  textAlign: "center",
  textAlignVertical: "center",
  width: "66%"
});

const Legend12 = style.text({
  ...legendStyle,
  fontFamily: CommonStyles.primaryFontFamilyLight,
  fontSize: 11,
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
  setHeader: (height: number) => void;
}

export class ThreadsTopBar extends React.PureComponent<IThreadsBarProps, {}> {
  public state = {
    expand: false,
    slideIndex: 0
  };

  public static expanded;

  public setHeaderHeight() {
    if (this.state.expand) {
      this.props.setHeader(220);
    } else {
      this.props.setHeader(56);
    }
  }

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
      [...to, ...cc, from].filter(el => el !== Me.session.userId)
    );
    if (imageSet.size === 0) {
      imageSet.add(Me.session.userId);
    }
    const images = [...imageSet];
    const names = images.map(el => displayNames.find(dn => dn[0] === el)[1]);

    return (
      <Header onLayout={() => this.setHeaderHeight()}>
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
  dispatch => ({
    setHeader: (height: number) => setHeader(dispatch)(height)
  })
)(ThreadsTopBar);
