import I18n from "i18n-js";
import * as React from "react";
import { Animated, Linking, View, FlatList, RefreshControl } from "react-native";
import { NavigationActions, NavigationScreenProp } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { connect } from "react-redux";
import style from "glamorous-native";

import Conf from "../../../ode-framework-conf";
import { signedFetch, fetchJSONWithCache } from "../../infra/fetchWithCache";
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
  newsData: object[];
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

export type INewsComment = {
  comment: string;
  created: string;
  modified: string;
  owner: string;
  username: string;
  _id: string;
}

export type IPostComment = INewsComment | IBlogComment;

// tslint:disable-next-line:max-classes-per-file
class NewsContentPage_Unconnected extends React.Component<
INewsContentPageProps,
{

}
> {

  componentDidMount() {
    !this.isSchoolbook && this.reloadCommentList(true);
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
        fetching: false,
        newsData: [],
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
        fetching: false,
        newsData: [],
      };
    }
  }

  // For blog posts, we need to make an extra call to fetch its comments
  // For news posts, we fetch the entire post (outside the html component) in order to display the comments
  public async reloadCommentList(clear = false) {
    const { isFetching, navigation, dispatch } = this.props;
    const type = navigation.getParam("news").type;
    const resource = navigation.getParam("news").resource;
    const resourceId = navigation.getParam("news").resourceId;
    const blogPostId = `${resource}/${resourceId}`;
    const url = navigation.state.params.news.url;
    
    if (isFetching) {
      return;
    } else if (type === "BLOG") {
      dispatch(fetchBlogCommentListAction(blogPostId, clear));
    } else if (type === "NEWS") {
      this.setState({ fetching: true });
      const newsData = await fetchJSONWithCache(url);
      this.setState({ newsData, fetching: false })
    }
  }

  public render() {
    let schoolbookData;
    if (this.isSchoolbook) {
      schoolbookData = this.getSchoolbookData();
    }
    const isParent = getSessionInfo().type && getSessionInfo().type.includes("Relative");
    const { isPristine, selectedBlogComments, navigation } = this.props;
    const { fetching, newsData  } = this.state;
    const { resourceId, resourceUri, type } = navigation.state.params.news;
    const newsComments = newsData.comments && JSON.parse(newsData.comments);
    const isCommentable = type === "BLOG" || type === "NEWS";
    const commentsData = type === "BLOG" ? selectedBlogComments : type === "NEWS" ? newsComments : undefined;

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
                {resourceUri && (!fetching || type == 'BLOG') && !(type == 'BLOG' && isPristine) ? (
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
              {commentsData && commentsData.length > 0 ?
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
                    {commentsData.length} {I18n.t("timeline-comment")}{commentsData.length > 1 && "s"}
                  </TextBright>
                </ListItem>
                :
                null
              }
            </View>
          }
          data={commentsData}
          renderItem={({ item }: { item: IPostComment }) => this.renderComment(item)}
          keyExtractor={(item: IPostComment) => (item as IBlogComment).id || (item as INewsComment)._id.toString()}
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
    const { type } = this.props.navigation.state.params.news;
    const { fetching, newsData } = this.state;

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
        {type === "NEWS" && fetching && !newsData.content
        ? <Loading/>
        : null
        }
        {type === "NEWS" && newsData.content && !fetching || type !== "NEWS" ?
          <HtmlContentView
            source={type === "NEWS" ? undefined : url}
            html={type === "NEWS" ? newsData.content : htmlContent}
            getContentFromResource={responseJSON => responseJSON.content}
            opts={{
              formatting: true,
              hyperlinks: true,
              iframes: true,
              images: true
            }}
          />
        : 
          null
        }
      </View>
    );
  }

  public renderComment(comment: IPostComment) {
    return(
      <ListItem style={{ backgroundColor: CommonStyles.lightBlue }}>
        <LeftPanel disabled>
          <GridAvatars
            users={[
              (comment as INewsComment).owner ||
              (comment as IBlogComment).author && (comment as IBlogComment).author.userId ||
              require("../../../assets/images/resource-avatar.png")
            ]}
            fallback={require("../../../assets/images/resource-avatar.png")}
          />
        </LeftPanel>
        <CenterPanel disabled>
          <View style={{ flexDirection: "row", alignItems: "center", width: "80%" }}>
            <CommentAuthor numberOfLines={2}>
              {(comment as INewsComment).username || (comment as IBlogComment).author && (comment as IBlogComment).author.username}
            </CommentAuthor>
            <CommentDate>
              {/* FIXME: Use moment.js instead of this */}
              {getTimeToStr(comment.created)}
            </CommentDate>
          </View>
          <TextPreview
            numberOfLines={5}
            textContent={comment.comment}
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
