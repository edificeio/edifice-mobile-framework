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

import Conf from "../../../ode-framework-conf";
import { getAuthHeader } from "../../infra/oauth";
import { fetchPublishableBlogsAction } from "../actions/publish";

export interface IContentSelectorPageDataProps {
  blogs: IBlogList;
  isFetching: boolean;
}

export interface IContentSelectorPageEventProps {
  onContentSelected: (blog: IBlog, postType: string) => void;
  onDidFocus: () => void;
}

export interface IContentSelectorPageOtherProps {
  navigation: NavigationScreenProp<NavigationState>;
}

export type IContentSelectorPageProps = IContentSelectorPageDataProps & IContentSelectorPageEventProps & IContentSelectorPageOtherProps;

export class ContentSelectorPage_Unconnected extends React.PureComponent<IContentSelectorPageProps> {

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<NavigationState> }) => {
    return alternativeNavScreenOptions(
      {
        title: I18n.t(`createPost-select-${navigation.getParam("postType")}`),
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
        renderItem={({ item }: { item: IBlog }) => this.renderContent(item)}
        alwaysBounceVertical={false}
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
    const { data: blogs, isFetching } = getPublishableBlogsState(state);
    return { blogs, isFetching };
  },
  (dispatch: ThunkDispatch<any, any, any>) => ({
    onContentSelected: (blog: IBlog, postType: string) => {
      mainNavNavigate('createPost', { blog, postType });
    },
    onDidFocus: () => {
      dispatch(fetchPublishableBlogsAction());
    }
  })
)(ContentSelectorPage_Unconnected);
