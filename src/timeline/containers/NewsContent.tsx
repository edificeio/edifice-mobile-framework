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
import { ListItem, LeftPanel, CenterPanel } from "../../myAppMenu/components/NewContainerContent";
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
  schoolbookData: object[];
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
  private unacknowledgedChildrenIds?: Array<string>;
  private schoolbookData?: Array<any>;
  protected getSchoolbookData() {
    if (!this.schoolbookData) {
      const sc = schoolbooks.filter(
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
    const { childrenIds } = this.props.navigation.state.params.news;
    const schoolbookData = this.getSchoolbookData();
    let acknowledgedChildrenIds = [];
    let isAck = false;

    if (!schoolbookData) return undefined;
    for (const schoolbook of schoolbookData) {
      schoolbook.acknowledgments && schoolbook.acknowledgments.map(ack => {
        if (getSessionInfo().userId === ack.owner) acknowledgedChildrenIds.push(schoolbook.childId);
      });
    }

    this.unacknowledgedChildrenIds = childrenIds.filter(childId => !acknowledgedChildrenIds.includes(childId))
    if (schoolbookData.length === acknowledgedChildrenIds.length) isAck = true;
    return isAck;
  }

  // Note: getAckNames() and getAckNumber() are only used for Students,
  // and Student only have one element in the "schoolbookData" array (unlike Teachers)
  // --> therefore, we can always use "schoolbookData[0]"
  protected getAckNames() {
    const schoolbookData = this.getSchoolbookData();
    if (!schoolbookData) return undefined;

    return schoolbookData[0].acknowledgments
      ? schoolbookData[0].acknowledgments.map(el => el.parent_name)
      : [];
  }

  protected getAckNumber() {
    const schoolbookData = this.getSchoolbookData();
    if (!schoolbookData) return undefined;

    return schoolbookData[0].acknowledgments
      ? schoolbookData[0].acknowledgments.length
      : schoolbookData[0].ack_number
      ? schoolbookData[0].ack_number
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
      this.props.navigation.setParams({ isAck });
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
    let schoolbookData;
    if (this.isSchoolbook) {
      schoolbookData = this.getSchoolbookData();
    }
    const isParent = getSessionInfo().type && getSessionInfo().type.includes("Relative");
    const { resourceId, resourceUri, type } = this.props.navigation.state.params.news;
    const { isFetching, isPristine, selectedBlogComments } = this.props;
    const { fetching } = this.state;
    const isCommentable = type === "BLOG" || type === "NEWS";

    return (
      <PageContainer>
        <ConnectionTrackingBar />
        {isParent && schoolbookData ? (
          <ModalBox
            backdropOpacity={0.5}
            isVisible={this.props.navigation.state.params.confirmBackSchoolbook}
          >
            {this.renderBackModal(resourceId, this.unacknowledgedChildrenIds)}
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
              {isCommentable && !isPristine && selectedBlogComments.length > 0 ?
                <ListItem
                  style={{ 
                    justifyContent: "flex-start",
                    alignItems: "center",
                    marginTop: 10,
                    marginBottom: 4,
                    shadowColor: "#6B7C93",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    elevation: 2,
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
    const { resourceId } = this.props.navigation.state.params.news;
    // Call it only for schoolbooks ! // TODO : reformat this component to be speicalized

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
          onPress={() => this.acknowledge(resourceId, this.unacknowledgedChildrenIds)}
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

  public async acknowledge(wordId, unacknowledgedChildrenIds) {
    // Call it only for schoolbooks !
    try {
      this.setState({ isAcking: true });
      const acknowledgements = unacknowledgedChildrenIds.map((id: string) => (
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

      let schoolbookData;
      if (this.isSchoolbook) schoolbookData = this.getSchoolbookData();
      if (schoolbookData) {
        for (const schoolbook of schoolbookData) {
          if (unacknowledgedChildrenIds.includes(schoolbook.childId)) {
            schoolbook.acknowledgments
            ? schoolbook.acknowledgments.push({ owner: getSessionInfo().userId })
            : schoolbook.acknowledgments = [{ owner: getSessionInfo().userId }]
          }
        }
      }

      Tracking.logEvent("confirmMessage");

      this.setState({
        isAck: true,
        isAcking: false,
        showAckBeforeMessage: true
      });
      this.props.navigation.setParams({ isAck: true });

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

  public renderBackModal(wordId, unacknowledgedChildrenIds) {
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
              this.props.navigation.setParams({
                confirmBackSchoolbook: false,
                forceBack: true
              });
              const navkey = this.props.navigation.state.key;
              requestAnimationFrame(() => {
                this.props.navigation.goBack(lastNavKey);
              });
            }}
            onValid={async () => {
              this.props.navigation.setParams({
                confirmBackSchoolbook: false,
                forceBack: true
              });
              await this.acknowledge(wordId, unacknowledgedChildrenIds);
              requestAnimationFrame(() => {
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
  if (
    action.type !== NavigationActions.BACK ||
    !state ||
    state.routes[state.index].params.news.application !== "schoolbook" ||
    (getSessionInfo().type && !getSessionInfo().type.includes("Relative"))
  )
    return defaultGetStateForAction(action, state);

  lastNavKey = state.key;

  if (state.routes[0].params.forceBack) {
    return defaultGetStateForAction(action, state);
  }

  const isAck = state.routes[state.index].params.isAck;

  if (!isAck) {
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
    return newstate;
  }

  return defaultGetStateForAction(action, state);
};
