import * as React from "react";
import { View, FlatList, TouchableOpacity, RefreshControl, Linking, Platform } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { ThunkDispatch } from "redux-thunk";
import { connect } from "react-redux";
import I18n from "i18n-js";

import moduleConfig from "../moduleConfig";
import withViewTracking from "../../../framework/util/tracker/withViewTracking";
import { PageView } from "../../../framework/components/page";
import { LoadingIndicator } from "../../../framework/components/loading";
import {
  FakeHeader,
  HeaderAction,
  HeaderCenter,
  HeaderLeft,
  HeaderRow,
  HeaderTitle,
} from "../../../framework/components/header";
import { TextLight, TextSemiBold } from "../../../framework/components/text";
import { IGlobalState } from "../../../AppStore";
import { getPublishableBlogListAction } from "../actions";
import { IBlog, IBlogList } from "../reducer";
import theme from "../../../framework/util/theme";
import { ListItem } from "../../../framework/components/listItem";
import { GridAvatars } from "../../../ui/avatars/GridAvatars";
import { legacyAppConf } from "../../../framework/util/appConf";
import { getAuthHeader } from "../../../infra/oauth";
import { Icon } from "../../../framework/components/icon";
import { EmptyScreen } from "../../../framework/components/emptyScreen";
import Conf from "../../../../ode-framework-conf";

// TYPES ==========================================================================================

export interface IBlogSelectScreenDataProps {
  // Add data props here
}
export interface IBlogSelectScreenEventProps {
  handleGetPublishableBlogList(): Promise<IBlogList | undefined>;
}
export interface IBlogSelectScreenNavParams {
  // Add nav params here
}
export type IBlogSelectScreenProps = IBlogSelectScreenDataProps &
  IBlogSelectScreenEventProps &
  NavigationInjectedProps<Partial<IBlogSelectScreenNavParams>>;

export enum BlogSelectLoadingState {
  PRISTINE,
  INIT,
  REFRESH,
  DONE,
}
export interface IBlogSelectScreenState {
  loadingState: BlogSelectLoadingState;
  blogsData: IBlogList | undefined;
  errorState: boolean;
}

// COMPONENT ======================================================================================

export class BlogSelectScreen extends React.PureComponent<IBlogSelectScreenProps, IBlogSelectScreenState> {
  // DECLARATIONS =================================================================================

  state: IBlogSelectScreenState = {
    loadingState: BlogSelectLoadingState.PRISTINE,
    blogsData: undefined,
    errorState: false,
  };

  // RENDER =======================================================================================

  render() {
    const { loadingState, errorState } = this.state;
    return (
      <>
        {this.renderHeader()}
        <PageView>
          {[BlogSelectLoadingState.PRISTINE, BlogSelectLoadingState.INIT].includes(loadingState) ? (
            <LoadingIndicator />
          ) : errorState ? (
            this.renderError()
          ) : (
            this.renderList()
          )}
        </PageView>
      </>
    );
  }

  renderHeader() {
    const { navigation } = this.props;
    return (
      <FakeHeader>
        <HeaderRow>
          <HeaderLeft>
            <HeaderAction
              iconName={Platform.OS === "ios" ? "chevron-left1" : "back"}
              iconSize={24}
              onPress={() => navigation.navigate("timeline")}
            />
          </HeaderLeft>
          <HeaderCenter>
            <HeaderTitle>{I18n.t("blog.blogSelectScreen.title")}</HeaderTitle>
          </HeaderCenter>
        </HeaderRow>
      </FakeHeader>
    );
  }

  renderError() {
    return <TextSemiBold>{"Error"}</TextSemiBold>; // ToDo: great error screen here
  }

  renderList() {
    const { loadingState, blogsData } = this.state;
    const isEmpty = blogsData?.length === 0;
    return (
      <FlatList
        data={blogsData}
        renderItem={({ item }: { item: IBlog }) => this.renderBlog(item)}
        keyExtractor={(item: IBlog) => item.id.toString()}
        contentContainerStyle={{
          flexGrow: 1,
          paddingVertical: isEmpty ? undefined : 12,
          backgroundColor: theme.color.background.card,
        }}
        ListEmptyComponent={this.renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={[BlogSelectLoadingState.REFRESH, BlogSelectLoadingState.INIT].includes(loadingState)}
            onRefresh={() => this.doRefresh()}
          />
        }
      />
    );
  }

  renderEmpty() {
    return (
      <EmptyScreen
        imageSrc={require("../../../../assets/images/empty-screen/blog.png")}
        imgWidth={265.98}
        imgHeight={279.97}
        title={I18n.t("blog.blogSelectScreen.emptyScreenTitle")}
        text={I18n.t("blog.blogSelectScreen.emptyScreenText")}
        buttonText={I18n.t("blog.blogSelectScreen.emptyScreenButton")}
        buttonAction={() => {
          //TODO: create generic function inside oauth (use in myapps, etc.)
          if (!Conf.currentPlatform) {
            console.warn("Must have a platform selected to redirect the user");
            return null;
          }
          const url = `${(Conf.currentPlatform as any).url}/blog`;
          Linking.canOpenURL(url).then(supported => {
            if (supported) {
              Linking.openURL(url);
            } else {
              console.warn("[timeline] Don't know how to open URI: ", url);
            }
          });
        }}
      />
    );
  }

  renderBlog(blog: IBlog) {
    const { navigation } = this.props;
    const blogShareNumber = blog.shared?.length;
    return (
      <TouchableOpacity onPress={() => navigation.navigate("timeline/blog/create", { blog })}>
        <ListItem
          leftElement={
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
              <GridAvatars
                users={[
                  blog.thumbnail
                    ? { headers: getAuthHeader(), uri: legacyAppConf.currentPlatform!.url + blog.thumbnail }
                    : require("../../../../assets/images/resource-avatar.png"),
                ]}
                fallback={require("../../../../assets/images/resource-avatar.png")}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <TextSemiBold numberOfLines={1}>{blog.title}</TextSemiBold>
                <TextLight style={{ fontSize: 12, marginTop: 8 }}>
                  {I18n.t(`blog.blogSelectScreen.sharedToNbPerson${blogShareNumber === 1 ? "" : "s"}`, {
                    nb: blogShareNumber || 0,
                  })}
                </TextLight>
              </View>
            </View>
          }
          rightElement={<Icon name="arrow_down" color={"#868CA0"} style={{ transform: [{ rotate: "270deg" }] }} />}
        />
      </TouchableOpacity>
    );
  }

  // LIFECYCLE ====================================================================================

  componentDidMount() {
    this.doInit();
  }

  // METHODS ======================================================================================

  async doInit() {
    try {
      this.setState({ loadingState: BlogSelectLoadingState.INIT });
      await this.doGetPublishableBlogList();
    } finally {
      this.setState({ loadingState: BlogSelectLoadingState.DONE });
    }
  }

  async doRefresh() {
    try {
      this.setState({ loadingState: BlogSelectLoadingState.REFRESH });
      await this.doGetPublishableBlogList();
    } finally {
      this.setState({ loadingState: BlogSelectLoadingState.DONE });
    }
  }

  async doGetPublishableBlogList() {
    try {
      const { handleGetPublishableBlogList } = this.props;
      const blogsData = await handleGetPublishableBlogList();
      if (!blogsData) {
        throw new Error("[doGetPublishableBlogList] failed to retrieve the publishable blog list");
      }
      this.setState({ blogsData });
    } catch (e) {
      // ToDo: Error handling
      this.setState({ errorState: true });
      console.warn(`[${moduleConfig.name}] doGetPublishableBlogList failed`, e);
    }
  }
}

// UTILS ==========================================================================================

// Add some util functions here

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => IBlogSelectScreenDataProps = s => ({});

const mapDispatchToProps: (
  dispatch: ThunkDispatch<any, any, any>,
  getState: () => IGlobalState
) => IBlogSelectScreenEventProps = (dispatch, getState) => ({
  handleGetPublishableBlogList: async () => {
    const blogs = ((await dispatch(getPublishableBlogListAction())) as unknown) as IBlogList;
    return blogs;
  },
});

const BlogSelectScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(BlogSelectScreen);
export default BlogSelectScreen_Connected;
