import * as React from "react";
import { connect } from "react-redux";
import {
  IThreadPageDataProps,
  IThreadPageEventProps,
  IThreadPageProps,
  ThreadPage
} from "../components/ThreadPage";
import conversationConfig from "../config";
import I18n from "i18n-js";
import style from "glamorous-native";

import {
  fetchConversationThreadNewerMessages,
  fetchConversationThreadOlderMessages
} from "../actions/threadList";
import { createActionReceiversDisplay, createActionThreadReceiversDisplay } from "../actions/displayReceivers";
import { IConversationMessage, IConversationThread, IConversationMessageList } from "../reducers";
import { NavigationScreenProp } from "react-navigation";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderBackAction, HeaderIcon } from "../../ui/headers/NewHeader";
import { getSessionInfo } from "../../AppStore";
import { RowAvatars } from "../../ui/avatars/RowAvatars";
import { Size } from "../../ui/avatars/Avatar";
import { CommonStyles } from "../../styles/common/styles";
import { View, TextStyle, TouchableOpacity } from "react-native";
import { FontWeight, Text } from "../../ui/text";

const mapStateToProps: (state: any) => IThreadPageDataProps = state => {
  // Extract data from state
  const localState: IConversationMessageList = state[conversationConfig.reducerName].messages;
  const selectedThreadId: string = state[conversationConfig.reducerName].threadSelected;
  const selectedThread: IConversationThread =
    state[conversationConfig.reducerName].threadList.data.byId[
    selectedThreadId
    ];
  // console.log("display thread", localState, selectedThreadId, selectedThread);
  const messages: IConversationMessage[] = selectedThread.messages.map(
    messageId => localState.data[messageId]
  );
  const headerHeight = state.ui.headerHeight; // TODO: Ugly.

  // Format props
  return {
    headerHeight,
    isFetching: selectedThread.isFetchingOlder,
    isRefreshing: selectedThread.isFetchingNewer,
    isFetchingFirst: selectedThread.isFetchingFirst,
    messages,
    threadInfo: selectedThread
  };
};

const mapDispatchToProps: (
  dispatch: any
) => IThreadPageEventProps = dispatch => {
  return {
    dispatch,
    onGetNewer: async (threadId: string) => {
      // console.log("get newer posts");
      await dispatch(fetchConversationThreadNewerMessages(threadId));
      return;
    },
    onGetOlder: (threadId: string) => {
      // console.log("get older posts");
      dispatch(fetchConversationThreadOlderMessages(threadId));
      return;
    },
    onTapReceivers: (message: IConversationMessage) => {
      dispatch(createActionReceiversDisplay(message))
      return;
    },
    onTapReceiversFromThread: (thread: IConversationThread) => {
      dispatch(createActionThreadReceiversDisplay(thread))
      return;
    }
  };
};

class ThreadPageContainer extends React.PureComponent<
  IThreadPageProps & { dispatch: any },
  {}
  > {

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    const showDetails = navigation.getParam("showDetails", false);
    const threadInfo = navigation.getParam("threadInfo");
    return standardNavScreenOptions({
      headerLeft: showDetails ? null : <HeaderBackAction navigation={navigation} />,
      headerRight: showDetails ? null : <View />,
      headerTitle: threadInfo ?
        showDetails ?
          ThreadPageContainer.renderDetailsThreadHeader(threadInfo, navigation)
          :
          ThreadPageContainer.renderThreadHeader(threadInfo, navigation)
        : <View><Text>Loading</Text></View>,
      headerStyle: {
        height: showDetails ? 56 + 160 : 56,
        overflow: "hidden"
      },
      headerLeftContainerStyle: {
        alignItems: "flex-start"
      },
      headerRightContainerStyle: {
        alignItems: "flex-start"
      },
      headerTitleContainerStyle: {
        alignItems: "flex-start",
      }
    }, navigation);
  }

  static getAvatarsAndNamesSet(threadInfo: IConversationThread) {
    const { displayNames, to, from } = threadInfo;
    let { cc } = threadInfo;
    cc = cc || [];
    const imageSet = new Set(
      [...to, ...cc, from].filter(el => el !== getSessionInfo().userId)
    );
    if (imageSet.size === 0) {
      imageSet.add(getSessionInfo().userId!);
    }
    const images = [...imageSet].map((receiverId: string) => {
      const foundDisplayName = displayNames.find(displayName => displayName[0] === receiverId);
      return foundDisplayName ? { id: receiverId, isGroup: foundDisplayName[2] } : {};
    })
    
    const names = [...imageSet].map((receiverId: string) => {
      const foundDisplayName = displayNames.find(displayName => displayName[0] === receiverId);
      return foundDisplayName ? foundDisplayName[1] : I18n.t("unknown-user");
    });

    return { images, names };
  }

  static renderThreadHeader(threadInfo: IConversationThread, navigation: NavigationScreenProp<{}>) {
    const { images } = ThreadPageContainer.getAvatarsAndNamesSet(threadInfo);
    return <CenterPanel
      onPress={() => { navigation.setParams({ showDetails: true }); }}
    >
      <RowAvatars images={images} size={Size.small} />
      <LittleTitle numberOfLines={1} smallSize={true}>
        {threadInfo.subject}
      </LittleTitle>
    </CenterPanel>
  }

  static renderDetailsThreadHeader(threadInfo: IConversationThread, navigation: NavigationScreenProp<{}>) {
    const { images, names } = ThreadPageContainer.getAvatarsAndNamesSet(threadInfo);
    return <View style={{
      alignItems: "stretch",
      width: "100%",
      flex: 0,
    }}>
      <View style={{
        flexDirection: "row",
        justifyContent: "center"
      }}>
        <HeaderBackAction navigation={navigation} style={{
          flex: 0
        }} />
        <View style={{
          flex: 1,
          alignItems: "stretch"
        }}>
          <CenterPanel
            onPress={() => { navigation.setParams({ showDetails: false }); }}
          >
            <LittleTitle numberOfLines={2}>
              {threadInfo.subject}
            </LittleTitle>
          </CenterPanel>
        </View>
        <HeaderIcon name={null} />
      </View>
      <ContainerAvatars>
        <RowAvatars
          onSlideIndex={slideIndex => {
            navigation.setParams({ slideIndex: slideIndex });
          }}
          images={images}
        />
        <Legend14 numberOfLines={2}>
          {names[navigation.getParam("slideIndex", 0)]}
        </Legend14>
      </ContainerAvatars>
    </View>
  }

  constructor(props: IThreadPageProps) {
    super(props);
    this.props.navigation!.setParams({
      threadInfo: this.props.threadInfo
    });
  }

  public render() {
    return <ThreadPage {...this.props} />;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ThreadPageContainer);

export const CenterPanel = style(TouchableOpacity)({
  alignItems: "stretch",
  justifyContent: "center",
  paddingVertical: 5,
  height: 56,
  flex: 1
});

export const LittleTitle = (style.text as any)(
  {
    color: "white",
    fontFamily: CommonStyles.primaryFontFamily,
    fontWeight: "400",
    textAlign: "center"
  },
  ({ smallSize = false }: { smallSize: boolean }) => ({
    fontSize: smallSize ? 12 : 16
  })
);

export const ContainerAvatars = style.view({
  alignItems: "center",
  flex: 0,
  height: 160,
  justifyContent: "flex-start"
});

const legendStyle: TextStyle = {
  alignSelf: "center",
  color: "white",
  flexWrap: "nowrap"
};

const Legend14 = style.text({
  ...legendStyle,
  fontFamily: CommonStyles.primaryFontFamily,
  fontWeight: FontWeight.Bold,
  textAlign: "center",
  textAlignVertical: "center",
  width: "66%",
  marginBottom: 30,
});
