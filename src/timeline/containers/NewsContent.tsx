import I18n from "i18n-js";
import * as React from "react";
import { Animated, Linking, View, FlatList, RefreshControl } from "react-native";
import { NavigationActions, NavigationScreenProp } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { connect } from "react-redux";
import style from "glamorous-native";

import Conf from "../../../ode-framework-conf";
import { signedFetch } from "../../infra/fetchWithCache";
import { alternativeNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { CommonStyles } from "../../styles/common/styles";
import Tracking from "../../tracking/TrackingManager";
import { ButtonsOkCancel, FlatButton, Icon, Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { ArticleContainer, PageContainer } from "../../ui/ContainerContent";
import { GridAvatars } from "../../ui/avatars/GridAvatars";
import { ResourceTitle } from "../../ui/headers/ResourceTitle";
import { HtmlContentView } from "../../ui/HtmlContentView";
import {
  ModalBox,
  ModalContent,
  ModalContentBlock,
  ModalContentText
} from "../../ui/Modal";
import { A, Italic, TextBright } from "../../ui/Typography";
import { HeaderBackAction } from "../../ui/headers/NewHeader";
import { FontWeight } from "../../ui/text";
import NewsTopInfo from "../components/NewsTopInfo";
import { ListItem, LeftPanel, CenterPanel, contentStyle } from "../../myAppMenu/components/NewContainerContent";
import { getSessionInfo } from "../../AppStore";
import { schoolbooks } from "../actions/dataTypes";
import { fetchBlogCommentListAction, dataActions } from "../actions/commentList";
import { getBlogCommentListState, IBlogComment, IBlogCommentList } from "../state/commentList";
import { getTimeToStr } from "../../utils/date";
import { TextPreview } from "../../ui/TextPreview";

interface INewsContentPageState {
  isAck: boolean;
  isAcking: boolean;
  isAckBefore: boolean;
  ackNames: string[];
  ackOpacity: Animated.Value;
  showAckBeforeMessage: boolean;
  schoolbookData: object;
  fetching: boolean;
}

export interface INewsContentPageDataProps {
  isPristine?: boolean;
  isFetching?: boolean;
  selectedBlogComments: IBlogCommentList;
}

export interface INewsContentPageOtherProps {
  navigation?: any;
  onRefresh?: () => void;
}

export type INewsContentPageProps = INewsContentPageDataProps &
INewsContentPageOtherProps &
INewsContentPageState;

// tslint:disable-next-line:max-classes-per-file
class NewsContentPage_Unconnected extends React.Component<
INewsContentPageProps,
{

}
> {

  getDerivedStateFromProps(nextProps: any, prevState: any) {
    if(nextProps.isFetching !== prevState.fetching){
      return { fetching: nextProps.isFetching};
   }
    else return null;
  }

  componentDidUpdate(prevProps: any) {
    const { isFetching } = this.props
    if(prevProps.isFetching !== isFetching){
      this.setState({fetching: isFetching});
    }
  }

  /**
   * get the schoolbook correpsonding data. Call it only if you're sure that the post is a schoolbook.
   */
  private schoolbookData;
  protected getSchoolbookData() {
    // console.log("schoolbooks", schoolbooks);
    // console.log(this.props.navigation.state.params);
    if (!this.schoolbookData) {
      const sc = schoolbooks.find(
        s =>
          s.id.toString() === this.props.navigation.state.params.news.resourceId
      );
      this.schoolbookData = sc;
      return sc;
    }
    return this.schoolbookData;
  }

  protected get isSchoolbook() {
    return this.props.navigation.state.params.news.application === "schoolbook";
  }

  protected getIsAck() {
    const schoolbookData = this.getSchoolbookData();
    // console.log("schoolbook data", schoolbookData);
    // console.log(this.props.navigation.state.params);
    let isAck = false;
    if (!schoolbookData) return undefined;
    if (schoolbookData.acknowledgments)
      schoolbookData.acknowledgments.map(ack => {
        if (getSessionInfo().userId === ack.owner) isAck = true;
      });
    return isAck;
  }

  protected getAckNames() {
    const schoolbookData = this.getSchoolbookData();
    if (!schoolbookData) return undefined;
    return schoolbookData.acknowledgments
      ? schoolbookData.acknowledgments.map(el => el.parent_name)
      : [];
  }

  protected getAckNumber() {
    const schoolbookData = this.getSchoolbookData();
    if (!schoolbookData) return undefined;
    // console.log("schoolbook data", schoolbookData);
    return schoolbookData.acknowledgments
      ? schoolbookData.acknowledgments.length
      : schoolbookData.ack_number
      ? schoolbookData.ack_number
      : 0;
  }

  constructor(props) {
    super(props);
    if (this.isSchoolbook) {
      const isAck = this.getIsAck();
      this.state = {
        ackNames: this.getAckNames(),
        ackOpacity: new Animated.Value(1),
        isAck,
        isAckBefore: isAck,
        isAcking: false,
        schoolbookData: null,
        showAckBeforeMessage: isAck,
        fetching: false
      };
    } else {
      // This dummy data prevent non-schoolbook posts to raise exceptions
      this.state = {
        ackNames: [],
        ackOpacity: new Animated.Value(1),
        isAck: false,
        isAckBefore: false,
        isAcking: false,
        schoolbookData: null,
        showAckBeforeMessage: false,
        fetching: false
      };
    }
    this.reloadCommentList(true);
  }

  public reloadCommentList(clear = false) {
    const { isFetching, navigation } = this.props;
    const type = navigation.getParam("news").type
    const resource = navigation.getParam("news").resource
    const resourceId = navigation.getParam("news").resourceId
    const blogPostId = `${resource}/${resourceId}`
    const isCommentable = type === "BLOG" || type === "NEWS";
    if (isFetching) return;
    isCommentable
    ? this.props.dispatch(fetchBlogCommentListAction(blogPostId, clear))
    : this.props.dispatch(dataActions.clear())
  }

  public render() {
    /*
    // console.log(
      "main render nav kay",
      this.props.navigation.state.key,
      this.props.navigation.state
    );
    */
    // console.log("render state", this.state);
    let schoolbookData;
    if (this.props.navigation.state.params.news.application === "schoolbook") {
      schoolbookData = schoolbooks.find(
        s =>
          s.id.toString() === this.props.navigation.state.params.news.resourceId
      );
    }
    const isParent = getSessionInfo().type && getSessionInfo().type.includes("Relative");
    const { resourceId, resourceUri, type } = this.props.navigation.state.params.news;
    const { isFetching, isPristine, selectedBlogComments } = this.props;
    const { fetching } = this.state;
    const isCommentable = type === "BLOG" || type === "NEWS";
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
        <FlatList
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom:
              !this.state.isAckBefore && isParent && schoolbookData
                ? 20 + 40 + 20
                : 20
          }}
          ListHeaderComponent={
            <View>
              <View style={{ paddingHorizontal: 20 }}>
                <ArticleContainer>{this.renderNews()}</ArticleContainer>
                {resourceUri ? (
                  <View style={{ marginTop: 12 }}>
                    <A
                      onPress={() => {
                        Tracking.logEvent("responsiveLink", {
                          application: this.props.navigation.state.params.news.application
                        });
                        Linking.openURL(Conf.currentPlatform.url + resourceUri);
                      }}
                    >
                      {I18n.t("timeline-viewInBrowser")}
                    </A>
                  </View>
                ) : null}
              </View>
              {isCommentable && !isPristine ?
                <ListItem
                  style={{ 
                    justifyContent: "flex-start",
                    alignItems: "center",
                    marginTop: 10,
                    marginBottom: 4,
                    shadowColor: "#6B7C93",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    elevation: 1,
                  }}
                >
                  <Icon
                    name="new_comment"
                    color={"#868CA0"}
                    size={16}
                    style={{ marginRight: 5 }}
                  />
                  <TextBright>
                    {selectedBlogComments.length} {I18n.t("timeline-comment")}{selectedBlogComments.length !== 1 && "s"}
                  </TextBright>
                </ListItem>
                :
                null
              }
            </View>
          }
          data={selectedBlogComments || null}
          renderItem={({ item }: { item: IBlogComment }) => this.renderBlogComment(item)}
          keyExtractor={(item: IBlogComment) => item.id}
          // FIXME: remove 'type === "BLOG"' condition (once implement API call for news-comments)
          ListEmptyComponent={type === "BLOG" && isFetching && isPristine ? <Loading /> : null}
          refreshControl={
            isCommentable
            ?
            <RefreshControl
              refreshing={fetching && !isPristine}
              onRefresh={() => {
                this.setState({ fetching: true })
                this.reloadCommentList()
              }}
            />
            : null
          }
        />
        {!this.state.isAckBefore && isParent && schoolbookData
          ? this.renderAck()
          : null
        }
      </PageContainer>
    );
  }

  public renderNews() {
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
    if (this.isSchoolbook) schoolbookData = this.getSchoolbookData();
    // console.log("session", getSessionInfo());
    const isStudent =
      getSessionInfo().type &&
      (getSessionInfo().type === "Student" || getSessionInfo().type.includes("Student"));
    const isParent =
      !isStudent && getSessionInfo().type && getSessionInfo().type.includes("Relative");
    const isTeacherOrPersonnel =
      !isStudent &&
      getSessionInfo().type &&
      (getSessionInfo().type.includes("Teacher") ||
        getSessionInfo().type.includes("Personnel"));
    return (
      <View style={{ width: "100%", flex: 1 }}>
        <NewsTopInfo {...this.props.navigation.state.params.news} />
        {// Show who has confirmed reading this word
        this.isSchoolbook && schoolbookData ? (
          isParent ? (
            // Case 1 : Parent
            this.state.showAckBeforeMessage ? (
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
            ) : null
          ) : // Case 2 : Teacher and Personnel
          isTeacherOrPersonnel ? (
            <View style={{ marginBottom: 12 }}>
              <Italic style={{ color: CommonStyles.lightTextColor }}>
                <Icon
                  name="eye"
                  color={CommonStyles.lightTextColor}
                  paddingHorizontal={12}
                />{" "}
                {I18n.t("schoolbook-readByNbRelatives", {
                  nb: this.getAckNumber()
                })}
              </Italic>
            </View>
          ) : isStudent ? ( // Case 3-1 : Student - someone has read
            this.state.ackNames.length ? (
              <View style={{ marginBottom: 12 }}>
                <Italic style={{ color: CommonStyles.lightTextColor }}>
                  <Icon
                    name="eye"
                    color={CommonStyles.lightTextColor}
                    paddingHorizontal={12}
                  />{" "}
                  {I18n.t("schoolbook-read-by")}{" "}
                  {this.state.ackNames.join(", ")}
                </Italic>
              </View> // Case 3-2 : Student - no one has read
            ) : (
              <View style={{ marginBottom: 12 }}>
                <Italic style={{ color: CommonStyles.lightTextColor }}>
                  <Icon
                    name="eye"
                    color={CommonStyles.lightTextColor}
                    paddingHorizontal={12}
                  />{" "}
                  {I18n.t("schoolbook-must-read")}
                </Italic>
              </View>
            )
          ) : null
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

  public renderBlogComment(blogComment: IBlogComment) {
    return(
      <ListItem style={{ backgroundColor: CommonStyles.lightBlue }}>
        <LeftPanel disabled>
          <GridAvatars
            users={[blogComment.author
            ? blogComment.author.userId
            : require("../../../assets/images/resource-avatar.png")
            ]}
            fallback={require("../../../assets/images/resource-avatar.png")}
          />
        </LeftPanel>
        <CenterPanel disabled>
          <View style={{ flexDirection: "row", alignItems: "center", width: "80%" }}>
            <CommentAuthor numberOfLines={2}>
              {blogComment.author.username}
            </CommentAuthor>
            <CommentDate>
              {/* FIXME: Use moment.js instead of this */}
              {getTimeToStr(blogComment.created)}
            </CommentDate>
          </View>
          <TextPreview
            numberOfLines={5}
            textContent={blogComment.comment}
            textStyle={{
              color: CommonStyles.textColor,
              fontFamily: CommonStyles.primaryFontFamily,
              fontSize: 12,
              marginTop: 5
            }}
            expandMessage={I18n.t("readMore")}
            expansionTextStyle={{ fontSize: 12 }}
          />
        </CenterPanel>
      </ListItem>
    )
  }

  public renderAck() {
    const { resourceId, childrenIds } = this.props.navigation.state.params.news;

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
          paddingVertical: 20,
          position: "absolute",
          width: "100%"
        }}
      >
        <FlatButton
          onPress={() => this.acknowledge(resourceId, childrenIds)}
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
          paddingVertical: 20,
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

  public async acknowledge(wordId, childrenIds) {
    // Call it only for schoolbooks !
    try {
      // console.log("acknowledge", wordId, childrenIds);
      this.setState({ isAcking: true });
      const acknowledgements = childrenIds.map((id: string) => (
        signedFetch(
          `${
            Conf.currentPlatform.url
          }/schoolbook/relation/acknowledge/${wordId}/${id}`,
          {
            method: "POST"
          }
        )
      ))
      const responses = await Promise.all(acknowledgements);
      
      responses.forEach((response: Response) => {
        if (!response.ok) {
          throw new Error(response.status + " " + response.statusText);
        }
      })

      const thisSchoolbook = schoolbooks.find(s => s.id.toString() === wordId);
      // console.log("this schoolbook", thisSchoolbook);
      if (thisSchoolbook) {
        if (thisSchoolbook.acknowledgments) {
          thisSchoolbook.acknowledgments.push({ owner: getSessionInfo().userId });
        } else {
          thisSchoolbook.acknowledgments = [{ owner: getSessionInfo().userId }];
        }
      }

      Tracking.logEvent("confirmMessage");

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

  public renderBackModal(wordId, childrenIds) {
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
              await this.acknowledge(wordId, childrenIds);
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

const CommentAuthor = style.text(
  {
    color: CommonStyles.textColor,
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 12,
    fontWeight: FontWeight.SemiBold,
    marginRight: 5,
  }
);

const CommentDate = style.text(
  {
    color: CommonStyles.lightTextColor,
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 10,
    fontWeight: FontWeight.Light,
  }
);

const NewsContentPage = connect(
  (state: any) => {
    const { data: selectedBlogComments, isFetching, isPristine } = getBlogCommentListState(state);
    return { selectedBlogComments, isFetching, isPristine };
  },
  (dispatch: any) => dispatch => {
    return {
      dispatch,
    }
  }
)(NewsContentPage_Unconnected);

export default NewsContentPage

export const NewsContentRouter = createStackNavigator(
  {
    NewsContentRouter: {
      screen: NewsContentPage
    }
  },
  {
    initialRouteName: "NewsContentRouter",
    headerMode: 'none'
  }
);
NewsContentRouter.navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) =>
  alternativeNavScreenOptions(
    {
      headerTitle: <ResourceTitle
        title={navigation.state.params && navigation.state.params.news.title}
        subTitle={navigation.state.params && navigation.state.params.news.subtitle}
      />,
      headerLeft: <HeaderBackAction navigation={navigation}/>
    },
    navigation
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
    state.routes[state.index].params.news.application !== "schoolbook" ||
    (getSessionInfo().type && !getSessionInfo().type.includes("Relative"))
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
  if (schoolbookData && schoolbookData.acknowledgments)
    schoolbookData.acknowledgments.map(ack => {
      if (getSessionInfo().userId === ack.owner) isAck = true;
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
