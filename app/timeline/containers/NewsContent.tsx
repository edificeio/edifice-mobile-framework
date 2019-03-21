import I18n from "i18n-js";
import * as React from "react";
import { ScrollView, View, Animated, Linking } from "react-native";

import { createStackNavigator, NavigationActions } from "react-navigation";
import Conf from "../../Conf";
import { signedFetch } from "../../infra/fetchWithCache";
import { Me } from "../../infra/Me";
import { navScreenOptions } from "../../navigation/helpers/navHelper";
import { CommonStyles } from "../../styles/common/styles";
import { ButtonsOkCancel, FlatButton, Icon } from "../../ui";
import { SingleAvatar } from "../../ui/avatars/SingleAvatar";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import {
  ArticleContainer,
  CenterPanel,
  Header,
  LeftPanel,
  PageContainer
} from "../../ui/ContainerContent";
import { DateView } from "../../ui/DateView";
import { ResourceTitle } from "../../ui/headers/ResourceTitle";
import { HtmlContentView } from "../../ui/HtmlContentView";
import {
  ModalBox,
  ModalContent,
  ModalContentBlock,
  ModalContentText
} from "../../ui/Modal";
import { Bold, Light, LightP, A, Italic } from "../../ui/Typography";
import { schoolbooks } from "../actions/dataTypes";
import NewsTopInfo from "../components/NewsTopInfo";

export class NewsContentHeader extends React.Component<
  { navigation?: any },
  undefined
> {
  public render() {
    const { news } = this.props.navigation.state.params;
    return (
      <ResourceTitle
        title={news.title}
        subTitle={news.subtitle}
        navigation={this.props.navigation}
      />
    );
  }
}

// tslint:disable-next-line:max-classes-per-file
export class NewsContent extends React.Component<
  { navigation?: any },
  {
    isAck: boolean;
    isAcking: boolean;
    isAckBefore: boolean;
    ackOpacity: Animated.Value;
    showAckBeforeMessage: boolean;
  }
> {
  constructor(props) {
    super(props);
    /* const {
      schoolbookData // Only for schoolbooks
    } = this.props.navigation.state.params.news; */
    if (this.props.navigation.state.params.news.application === "schoolbook") {
      // console.log("schoolbooks loaded", schoolbooks);
      // console.log("news", this.props.navigation.state.params.news);
      const schoolbookData = schoolbooks.find(
        s =>
          s.id.toString() === this.props.navigation.state.params.news.resourceId
      );
      let isAck = false;
      // console.log("schoolbookData", schoolbookData);
      if (schoolbookData.acknowledgments)
        schoolbookData.acknowledgments.map(ack => {
          if (Me.session.userId === ack.owner) isAck = true;
        });
      this.state = {
        ackOpacity: new Animated.Value(1),
        isAck,
        isAckBefore: isAck,
        isAcking: false,
        showAckBeforeMessage: isAck
      };
    } else {
      // This dummy data prevent non-schoolbook posts to raise exceptions
      this.state = {
        ackOpacity: new Animated.Value(1),
        isAck: false,
        isAckBefore: false,
        isAcking: false,
        showAckBeforeMessage: false
      };
    }
  }

  public newsContent() {
    const {
      date,
      id,
      images,
      htmlContent,
      message,
      resource,
      resourceId,
      resourceName,
      senderId,
      senderName,
      subtitle,
      title,
      url
    } = this.props.navigation.state.params.news;
    let schoolbookData;
    if (this.props.navigation.state.params.news.application === "schoolbook") {
      schoolbookData = schoolbooks.find(
        s =>
          s.id.toString() === this.props.navigation.state.params.news.resourceId
      );
    }
    const isParent = Me.session.type && Me.session.type.includes("Relative");
    return (
      <View>
        <NewsTopInfo {...this.props.navigation.state.params.news} />
        {this.state.showAckBeforeMessage && isParent && schoolbookData ? (
          <View style={{ marginBottom: 12 }}>
            <Italic style={{ color: CommonStyles.lightTextColor }}>
              <Icon
                name="eye"
                color={CommonStyles.lightTextColor}
                paddingHorizontal={12}
              />{" "}
              {I18n.t("schoolbook-already-confirmed")}
            </Italic>
          </View>
        ) : null}
        <HtmlContentView
          source={url}
          getContentFromResource={responseJSON => responseJSON.content}
          opts={{
            formatting: true,
            hyperlinks: true,
            iframes: true,
            images: true
          }}
          html={htmlContent}
        />
      </View>
    );
  }

  public render() {
    /*
    // console.log(
      "main render nav kay",
      this.props.navigation.state.key,
      this.props.navigation.state
    );
    */
    let schoolbookData;
    if (this.props.navigation.state.params.news.application === "schoolbook") {
      schoolbookData = schoolbooks.find(
        s =>
          s.id.toString() === this.props.navigation.state.params.news.resourceId
      );
    }
    const isParent = Me.session.type && Me.session.type.includes("Relative");
    const { resourceId, resourceUri } = this.props.navigation.state.params.news;
    // console.log("nav state params", this.props.navigation.state.params);
    return (
      <PageContainer>
        <ConnectionTrackingBar />
        {isParent && schoolbookData ? (
          <ModalBox
            backdropOpacity={0.5}
            isVisible={this.props.navigation.state.params.confirmBackSchoolbook}
          >
            {this.renderBackModal(resourceId, schoolbookData.childId)}
          </ModalBox>
        ) : null}
        <ScrollView
          contentContainerStyle={{
            paddingBottom:
              !this.state.isAckBefore && isParent && schoolbookData
                ? 20 + 24 + 14
                : 20,
            paddingHorizontal: 20,
            paddingTop: 20
          }}
        >
          <ArticleContainer>{this.newsContent()}</ArticleContainer>
          {resourceUri ? (
            <View style={{ marginTop: 12 }}>
              <A
                onPress={() => {
                  Linking.openURL(Conf.currentPlatform.url + resourceUri);
                }}
              >
                {I18n.t("timeline-viewInBrowser")}
              </A>
            </View>
          ) : null}
        </ScrollView>
        {!this.state.isAckBefore && isParent && schoolbookData
          ? this.renderAck()
          : null}
      </PageContainer>
    );
  }

  public renderAck() {
    const { resourceId } = this.props.navigation.state.params.news;

    // Call it only for schoolbooks ! // TODO : reformat this component to be speicalized
    const schoolbookData = schoolbooks.find(
      s =>
        s.id.toString() === this.props.navigation.state.params.news.resourceId
    );

    // console.log("this.state", this.state);

    return !this.state.isAck ? (
      <View
        style={{
          alignItems: "center",
          backgroundColor: "rgba(248,248,250, 0.7)",
          bottom: 0,
          justifyContent: "center",
          paddingVertical: 12,
          position: "absolute",
          width: "100%"
        }}
      >
        <FlatButton
          onPress={() => this.acknowledge(resourceId, schoolbookData.childId)}
          title={I18n.t("schoolbook-acknowledge")}
          loading={this.state.isAcking}
        />
      </View>
    ) : (
      <Animated.View
        style={{
          alignItems: "center",
          backgroundColor: "rgba(248,248,250, 0.7)",
          bottom: 0,
          justifyContent: "center",
          opacity: this.state.ackOpacity, // opacity animation
          paddingVertical: 12,
          position: "absolute",
          width: "100%"
        }}
      >
        <View
          style={{
            backgroundColor: CommonStyles.actionColor,
            borderRadius: 9 + 14 * 0.5,
            padding: 9,
            width: 14 + 18
          }}
        >
          <Icon
            name="checked"
            style={{
              color: CommonStyles.inverseColor,
              fontSize: 14,
              textAlignVertical: "center"
            }}
          />
        </View>
      </Animated.View>
    );
  }

  public async acknowledge(wordId, childId) {
    // Call it only for schoolbooks !
    try {
      // console.log("acknowledge", wordId, childId);
      this.setState({ isAcking: true });
      const response = await signedFetch(
        `${
          Conf.currentPlatform.url
        }/schoolbook/relation/acknowledge/${wordId}/${childId}`,
        {
          method: "POST"
        }
      );
      if (!response.ok) {
        throw new Error(response.status + " " + response.statusText);
      }
      const thisSchoolbook = schoolbooks.find(s => s.id.toString() === wordId);
      // console.log("this schoolbook", thisSchoolbook);
      if (thisSchoolbook) {
        if (thisSchoolbook.acknowledgments) {
          thisSchoolbook.acknowledgments.push({ owner: Me.session.userId });
        } else {
          thisSchoolbook.acknowledgments = [{ owner: Me.session.userId }];
        }
      }
      this.setState({
        isAck: true,
        isAcking: false,
        showAckBeforeMessage: true
      });
      Animated.timing(
        // Animate over time
        this.state.ackOpacity, // The animated value to drive
        {
          delay: 3000, // Start after 3s
          duration: 1000, // Make it take a while
          toValue: 0, // Animate to opacity: 0 (transparent),
          useNativeDriver: true
        }
      ).start(); // Starts the animation
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.warn(e);
    }
  }

  public renderBackModal(wordId, childId) {
    return (
      <ModalContent>
        <ModalContentBlock>
          <ModalContentText>
            {I18n.t("schoolbook-back-without-ack-confirm")}
          </ModalContentText>
        </ModalContentBlock>
        <ModalContentBlock>
          <ButtonsOkCancel
            onCancel={() => {
              // console.log("will NOT ack");
              /* console.log(
              "will go back",
              this.props.navigation.state.key,
              this.props.navigation.state
            );*/
              this.props.navigation.setParams({
                confirmBackSchoolbook: false,
                forceBack: true
              });
              const navkey = this.props.navigation.state.key;
              requestAnimationFrame(() => {
                /* console.log(
                "go back",
                this.props.navigation.state.key,
                this.props.navigation.state
              ); */
                // console.log(lastNavKey);
                this.props.navigation.goBack(lastNavKey);
              });
            }}
            onValid={async () => {
              // console.log("will ACK");
              /* console.log(
              "will go back",
              this.props.navigation.state.key,
              this.props.navigation.state
            ); */
              this.props.navigation.setParams({
                confirmBackSchoolbook: false,
                forceBack: true
              });
              await this.acknowledge(wordId, childId);
              requestAnimationFrame(() => {
                /* console.log(
                "go back",
                this.props.navigation.state.key,
                this.props.navigation.state
              ); */
                // console.log(lastNavKey);
                this.props.navigation.goBack(lastNavKey);
              });
            }}
            title={I18n.t("schoolbook-back-with-ack")}
            cancelText={I18n.t("schoolbook-back-without-ack")}
          />
        </ModalContentBlock>
      </ModalContent>
    );
  }
}

export const NewsContentRouter = createStackNavigator(
  {
    NewsContentRouter: {
      navigationOptions: ({ navigation }) =>
        navScreenOptions(
          {
            header: null,
            tabBarVisible: false
          },
          navigation
        ),
      screen: NewsContent
    }
  },
  {
    initialRouteName: "NewsContentRouter"
  }
);

const defaultGetStateForAction = NewsContentRouter.router.getStateForAction;

// That's a BIG HACK to make the router goBack programmatically.
// Strangely, we have to store the navigation state key at a certain point to make a good goBack action.
let lastNavKey;

NewsContentRouter.router.getStateForAction = (action, state) => {
  // console.log("getStateForAction", state, action);
  if (
    action.type !== NavigationActions.BACK ||
    !state ||
    state.routes[state.index].params.news.application !== "schoolbook"
  )
    return defaultGetStateForAction(action, state);

  lastNavKey = state.key;

  if (state.routes[0].params.forceBack) {
    // console.log("ok, go back");
    return defaultGetStateForAction(action, state);
  }

  // console.log("getStateForAction suite", state, action);

  const schoolbookData = schoolbooks.find(
    s => s.id.toString() === state.routes[state.index].params.news.resourceId
  );
  let isAck = false;
  // console.log("schoolbookData", schoolbookData);
  if (schoolbookData.acknowledgments)
    schoolbookData.acknowledgments.map(ack => {
      if (Me.session.userId === ack.owner) isAck = true;
    });
  // console.log("is ack", isAck);

  if (!isAck) {
    // console.log("will cancel back action and change params");
    // Returning null from getStateForAction means that the action
    // has been handled/blocked, but there is not a new state
    /*return {
      ...state,
      params: {
        ...state.params,
        confirmBackSchoolbook: true
      }
    };*/
    const newstate = defaultGetStateForAction(
      NavigationActions.setParams({
        key: state.routes[0].key,
        params: { confirmBackSchoolbook: true }
      }),
      state
    );
    // console.log("newstate", newstate);
    return newstate;
  }

  return defaultGetStateForAction(action, state);
};
