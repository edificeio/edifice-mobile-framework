import * as React from "react";
import I18n from "i18n-js";
import { connect } from "react-redux";
import style from "glamorous-native";

import { IBlogList, IBlog, getPublishableBlogsState } from "../state/publishableBlogs";
import { NavigationScreenProp, NavigationState, NavigationEventSubscription } from "react-navigation";
import { alternativeNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderBackAction } from "../../ui/headers/NewHeader";
import { PageContainer } from "../../ui/ContainerContent";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { FlatList } from "react-native-gesture-handler";
import { ListItem, LeftPanel, CenterPanel, RightPanel } from "../../myAppMenu/components/NewContainerContent";
import { GridAvatars } from "../../ui/avatars/GridAvatars";
import { FontWeight } from "../../ui/text";
import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui/icons/Icon";
import CustomTouchableOpacity from "../../ui/CustomTouchableOpacity";
import { ThunkDispatch } from "redux-thunk";
import { View, RefreshControl, Linking } from "react-native";
import { mainNavNavigate } from "../../navigation/helpers/navHelper";

import Conf from "../../../ode-framework-conf";
import { getAuthHeader } from "../../infra/oauth";
import { fetchPublishableBlogsAction } from "../actions/publish";
import { Loading } from "../../ui/Loading";
import { EmptyScreen } from "../../ui/EmptyScreen";
import { traceProps } from "../../utils/debugPropTrace";

export interface IContentSelectorPageDataProps {
  blogs: IBlogList;
  isFetching: boolean;
  isPristine: boolean;
}

export interface IContentSelectorPageEventProps {
  onContentSelected: (blog: IBlog, postType: string) => void;
  onDidFocus: () => void;
  onRefresh: () => void;
}

export interface IContentSelectorPageOtherProps {
  navigation: NavigationScreenProp<NavigationState>;
}

export type IContentSelectorPageProps = IContentSelectorPageDataProps & IContentSelectorPageEventProps & IContentSelectorPageOtherProps;

export type IContentSelectorPageState = {
  isFetching: boolean;
}

export class ContentSelectorPage_Unconnected extends React.PureComponent<IContentSelectorPageProps, IContentSelectorPageState> {

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<NavigationState> }) => {
    return alternativeNavScreenOptions(
      {
        title: I18n.t(`createPost-select-${navigation.getParam("postType")}`),
        headerLeft: <HeaderBackAction navigation={navigation} />
      },
      navigation
    );
  };

  protected didFocusSubscription?: NavigationEventSubscription;

  componentDidUpdate(prevProps, prevState) {
    const { isFetching } = this.props
    if (prevProps.isFetching !== isFetching) {
      this.setState({ isFetching });
    }
  }

  state: IContentSelectorPageState = {
    isFetching: false
  }

  render() {
    const isEmpty = this.props.blogs && this.props.blogs.length === 0;
    return <PageContainer>
      <ConnectionTrackingBar />

      <FlatList
        data={this.props.blogs || []}
        keyExtractor={(item: IBlog) => item._id}
        renderItem={({ item }: { item: IBlog }) => this.renderContent(item)}
        alwaysBounceVertical={true}
        refreshControl={
          !this.props.isPristine ?
            <RefreshControl
              refreshing={this.state.isFetching}
              onRefresh={() => {
                this.setState({ isFetching: true });
                this.props.onRefresh();
              }}
            /> : undefined
        }
        contentContainerStyle={isEmpty ? { flex: 1 } : undefined}
        ListEmptyComponent={
          this.props.isPristine ?
            <Loading /> :
            <EmptyScreen
              imageSrc={require("../../../assets/images/empty-screen/blog.png")}
              imgWidth={265.98}
              imgHeight={279.97}
              text={I18n.t("blog-emptyScreenText")}
              title={I18n.t("blog-emptyScreenTitle")}
              buttonText={I18n.t("blog-emptyScreenButton")}
              buttonAction={() => {
                const url = `${(Conf.currentPlatform as any).url}/blog`;
                Linking.canOpenURL(url).then(supported => {
                  if (supported) {
                    Linking.openURL(url);
                  } else {
                    console.warn("[Blog] Cannot open URL: ", url);
                  }
                });
              }}
            />
        }
      />
    </PageContainer>
  }

  renderContent(item: IBlog) {
    const postType = this.props.navigation.getParam("postType")
    return <ListItem style={{ width: '100%' }}>
      <LeftPanel onPress={() => this.props.onContentSelected(item, postType)}>
        <GridAvatars users={[item.thumbnail
          ? { ...getAuthHeader(), uri: Conf.currentPlatform.url + item.thumbnail }
          : require("../../../assets/images/resource-avatar.png")
        ]}
          fallback={require("../../../assets/images/resource-avatar.png")} />
      </LeftPanel>
      <CustomTouchableOpacity style={{ flexDirection: 'row', flex: 1 }} onPress={() => this.props.onContentSelected(item, postType)}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <CenterPanel onPress={() => this.props.onContentSelected(item, postType)}>
            <BlogTitle numberOfLines={1}>
              {item.title}
            </BlogTitle>
            <Content>
              {I18n.t('createPost-sharedToNbPersons', { nb: item.shared?.length || 0 })}
            </Content>
          </CenterPanel>
          <RightPanel onPress={() => this.props.onContentSelected(item, postType)}>
            <Icon
              name="arrow_down"
              color={"#868CA0"}
              style={{ transform: [{ rotate: "270deg" }] }}
            />
          </RightPanel>
        </View>
      </CustomTouchableOpacity>
    </ListItem>;
  }

  componentDidMount() {
    this.didFocusSubscription = this.props.navigation.addListener('didFocus', this.props.onDidFocus.bind(this));
  }

  componentWillUnmount() {
    this.didFocusSubscription?.remove();
  }

}

const BlogTitle = style.text(
  {
    color: CommonStyles.textColor,
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 14,
    fontWeight: FontWeight.SemiBold
  }
);

export const Content = style.text({
  color: CommonStyles.iconColorOff,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 12,
  fontWeight: FontWeight.Light,
  marginTop: 10
});

export default connect(
  (state: any) => {
    const { data: blogs, isFetching, isPristine } = getPublishableBlogsState(state);
    return { blogs, isFetching, isPristine };
  },
  (dispatch: ThunkDispatch<any, any, any>) => ({
    onContentSelected: (blog: IBlog, postType: string) => {
      mainNavNavigate('createPost', { blog, postType });
    },
    onDidFocus: () => {
      // dispatch(fetchPublishableBlogsAction());
    },
    onRefresh: () => {
      dispatch(fetchPublishableBlogsAction());
    }
  })
)(ContentSelectorPage_Unconnected);
