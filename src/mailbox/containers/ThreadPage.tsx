import * as React from "react";
import { View, TextStyle } from "react-native";
import { NavigationScreenProp, NavigationActions} from "react-navigation";
import { connect } from "react-redux";
import I18n from "i18n-js";
import style from "glamorous-native";

import { 
  IThreadPageDataProps,
  IThreadPageEventProps, 
  IThreadPageProps, 
  ThreadPage 
} from "../components/ThreadPage";
import conversationConfig from "../config";
import { 
  fetchConversationThreadNewerMessages, 
  fetchConversationThreadOlderMessages
} from "../actions/apiHelper";
import { IConversationMessage, IConversationThread, IConversationMessageList } from "../reducers";
import { alternativeNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderAction } from "../../ui/headers/NewHeader";
import { getSessionInfo } from "../../App";
import { CommonStyles } from "../../styles/common/styles";
import { FontWeight } from "../../ui/text";
import deviceInfoModule from "react-native-device-info";
import withViewTracking from "../../infra/tracker/withViewTracking";
import { IconButton } from "../../ui/IconButton";
import { createActionReceiversDisplay, createActionThreadReceiversDisplay } from "../actions/displayReceivers";
import conversationThreadSelected from "../actions/threadSelected";
import { Trackers } from "../../infra/tracker";

const mapStateToProps: (state: any) => IThreadPageDataProps = state => {
  // Extract data from state
  const localState: IConversationMessageList = state[conversationConfig.reducerName].messages;
  const selectedThreadId: string = state[conversationConfig.reducerName].threadSelected;
  const selectedThread: IConversationThread =
    state[conversationConfig.reducerName].threadList.data.byId[
      selectedThreadId
    ];
  // console.log("display thread", localState, selectedThreadId, selectedThread);
  const messages: IConversationMessage[] = selectedThread && selectedThread.messages.map(
    messageId => localState.data[messageId]
    );
  const headerHeight = state.ui.headerHeight; // TODO: Ugly.

  // Format props
  return {
    headerHeight,
    isFetching: selectedThread && selectedThread.isFetchingOlder,
    isRefreshing: selectedThread && selectedThread.isFetchingNewer,
    isFetchingFirst: selectedThread && selectedThread.isFetchingFirst,
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
    },
    onSelectThread: (threadId: string) => {
      dispatch(conversationThreadSelected(threadId))
      return;
    }
  };
};

class ThreadPageContainer extends React.PureComponent<
  IThreadPageProps & { dispatch: any }, 
  { selectedMessage?: IConversationMessage }
  > {

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    const threadInfo = navigation.getParam("threadInfo");
    const onTapReceivers = navigation.getParam("onTapReceivers");
    const selectedMessage: IConversationMessage | undefined = navigation.getParam("selectedMessage");
    const parentThread = navigation.getParam('parentThread');
    if (selectedMessage) {
      return alternativeNavScreenOptions({
        headerLeft: <HeaderAction name="close" onPress={() => {
          navigation?.setParams({ selectedMessage: undefined });
        }}/>,
        headerRight: <View style={{ flexDirection: "row" }}>
          <HeaderAction title={I18n.t("conversation-reply")} onPress={() => {
            navigation.navigate('newThread', {
              type: 'reply',
              message: selectedMessage,
              parentThread: threadInfo
            })
            Trackers.trackEvent("Conversation", "REPLY TO MESSAGE");
          }}/>
          <HeaderAction title={I18n.t("conversation-transfer")} onPress={() => {
            navigation.navigate('newThread', {
              type: 'transfer',
              message: selectedMessage,
              parentThread: threadInfo
            })
            Trackers.trackEvent("Conversation", "TRANSFER MESSAGE");
          }}/>
        </View>,
        headerStyle: {
          backgroundColor: CommonStyles.orangeColorTheme
        },
        headerTitle: null
      }, navigation);
    } else {
      return alternativeNavScreenOptions({
        headerLeft: 
          <HeaderAction
            onPress={() => {
              navigation.dispatch(NavigationActions.back());
            }}
            name="back"
          />,
        headerRight:
          <View style={{flexDirection: "row", alignItems: "center"}}>
            <View style={{ width: 1, height: "80%", backgroundColor: "#FFF" }} />
            <HeaderAction
              customComponent={
                <View 
                  style={{ 
                    alignItems: "center",
                    justifyContent: "center",
                    width: 100,
                    height: "100%"
                  }}
                >
                  <IconButton
                    iconName="informations"
                    iconSize={16}
                    buttonStyle={{ height: 18, width: 18, borderRadius: undefined, backgroundColor: undefined }}
                  />
                  <LittleTitle smallSize italic>
                    {I18n.t("seeDetails")}
                  </LittleTitle>
                </View>
              }
              onPress={() => {
                //TODO move orchestration to thunk
                onTapReceivers && onTapReceivers(threadInfo);
                navigation.navigate("listReceivers");
              }}
              />
          </View>,
        headerTitle: threadInfo
          ? ThreadPageContainer.renderThreadHeader(threadInfo, navigation)
          : <LittleTitle smallSize>{I18n.t("loading")}</LittleTitle>,
        headerStyle: {
          height: deviceInfoModule.hasNotch() ? 100 : 56
        },
        headerLeftContainerStyle: {
          alignItems: "flex-start"
        },
        headerRightContainerStyle: {
          alignItems: "flex-start"
        },
        headerTitleContainerStyle: {
          alignItems: "flex-start",
          width: "100%",
          flex: 1,
          marginRight: 100,
          justifyContent: "flex-start",
          textAlign: "left"
        }
      }, navigation);
    }
  }

  static getAvatarsAndNamesSet(threadInfo: IConversationThread) {
    const { displayNames, to, from } = threadInfo;
    let { cc } = threadInfo;
    cc = cc || [];
    const imageSet = new Set(
      [...to, ...cc, from].filter(el => el && el !== getSessionInfo().userId)
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
    const receiversText = threadInfo.to.length > 1
      ? I18n.t("conversation-receivers", { count: threadInfo.to.length })
      : I18n.t("conversation-receiver");

    return (
      <CenterPanel>
        <LittleTitle numberOfLines={1} smallSize>
          {threadInfo.subject}
        </LittleTitle>
        <LittleTitle smallSize italic>
          {receiversText}
        </LittleTitle>
      </CenterPanel>
    )
  }

  constructor(props: IThreadPageProps) {
    super(props);
    this.props.navigation!.setParams({
      threadInfo: this.props.threadInfo,
      onTapReceivers: this.props.onTapReceivers,
      onSelectThread: this.props.onSelectThread
    });
  }

  componentDidUpdate(prevProps: IThreadPageProps) {
    if (this.props.threadInfo?.id !== prevProps.threadInfo?.id) {
      this.props.navigation!.setParams({
        threadInfo: this.props.threadInfo,
        onTapReceivers: this.props.onTapReceivers,
        onSelectThread: this.props.onSelectThread
      });
    }
  }

  componentWillUnmount() {
    const { navigation } = this.props;
    const onSelectThread = navigation?.getParam("onSelectThread");
    const parentThread = navigation?.getParam('parentThread');
    const parentThreadId = parentThread && parentThread.id;
    parentThreadId && onSelectThread(parentThreadId);
  }

  public render() {
    const backMessage = this.props.navigation?.getParam('message');
    const sendingType = this.props.navigation?.getParam('type', 'new');
    const messageDraft = this.props.navigation?.getParam('draft');
    return (
      <ThreadPage
        {...this.props}
        onSelectMessage={message => {
          this.props.navigation?.setParams({ selectedMessage: message });
        }}
        backMessage={backMessage}
        sendingType={sendingType}
        messageDraft={messageDraft}
      />
    );
  }
}

const ThreadPageContainerConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(ThreadPageContainer);

export default withViewTracking("conversation/thread")(ThreadPageContainerConnected);

export const CenterPanel = style.view({
  alignItems: "stretch",
  justifyContent: "center",
  paddingVertical: 5,
  height: 56,
  flex: 1,
});

export const LittleTitle = (style.text as any)(
  {
    color: "white",
    fontFamily: CommonStyles.primaryFontFamily,
    fontWeight: "400",
  },
  ({ smallSize = false, italic = false }: { smallSize: boolean, italic: boolean }) => ({
    fontSize: smallSize ? 12 : 16,
    fontStyle: italic ? "italic" : "normal",
  })
);

export const ContainerAvatars = style.view({
  alignItems: "center",
  flex: 0,
  height: 160,
  justifyContent: "flex-start",
});

const legendStyle: TextStyle = {
  alignSelf: "center",
  color: "white",
  flexWrap: "nowrap",
};

const Legend14 = style.text({
  ...legendStyle,
  fontFamily: CommonStyles.primaryFontFamily,
  fontWeight: FontWeight.Bold,
  textAlign: "center",
  textAlignVertical: "center",
  width: "66%",
  marginBottom: 10,
  height: 40,
});
