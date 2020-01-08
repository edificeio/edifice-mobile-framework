import * as React from "react";
import I18n from "i18n-js";
import { connect } from "react-redux";
import style from "glamorous-native";

import { IBlogList, IBlog, getPublishableBlogsState } from "../state/publishableBlogs";
import { NavigationScreenProp, NavigationState } from "react-navigation";
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
import { View } from "react-native";
import { mainNavNavigate } from "../../navigation/helpers/navHelper";

export interface IBlogSelectorPageDataProps {
  blogs: IBlogList;
  isFetching: boolean;
}

export interface IBlogSelectorPageEventProps {
  onBlogSelected: (blog: IBlog) => void;
}

export interface IBlogSelectorPageOtherProps {
  navigation: NavigationScreenProp<NavigationState>;
}

export type IBlogSelectorPageProps = IBlogSelectorPageDataProps & IBlogSelectorPageEventProps & IBlogSelectorPageOtherProps;

export class BlogSelectorPage_Unconnected extends React.PureComponent<IBlogSelectorPageProps> {

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<NavigationState> }) => {
    return alternativeNavScreenOptions(
      {
        title: I18n.t("blog-selectPublishableBlog"),
        headerLeft: <HeaderBackAction navigation={navigation} />
      },
      navigation
    );
  };

  render() {
    return <PageContainer>
      <ConnectionTrackingBar />
      <FlatList
        data={this.props.blogs || []}
        keyExtractor={(item: IBlog) => item._id}
        renderItem={({ item }: { item: IBlog }) => this.renderBlog(item)}
      />
    </PageContainer>
  }

  renderBlog(blog: IBlog) {
    return <ListItem style={{ width: '100%' }}>
      <LeftPanel onPress={() => this.props.onBlogSelected(blog)}>
        <GridAvatars users={[blog.thumbnail || require("../../../assets/images/system-avatar.png")]} />
      </LeftPanel>
      <CustomTouchableOpacity style={{ flexDirection: 'row', flex: 1 }} onPress={() => this.props.onBlogSelected(blog)}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <CenterPanel onPress={() => this.props.onBlogSelected(blog)}>
            <BlogTitle numberOfLines={1}>
              {blog.title}
            </BlogTitle>
            <Content>
              {I18n.t('blog-sharedToNbPersons', { nb: blog.shared?.length || 0 })}
            </Content>
          </CenterPanel>
          <RightPanel onPress={() => this.props.onBlogSelected(blog)}>
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
    const { data: blogs, isFetching } = getPublishableBlogsState(state);
    return { blogs, isFetching };
  },
  (dispatch: ThunkDispatch<any, any, any>) => ({
    onBlogSelected: (blog: IBlog) => {
      console.log("Selected", blog);
      mainNavNavigate('blogCreatePost', {blog});
    }
  })
)(BlogSelectorPage_Unconnected);
