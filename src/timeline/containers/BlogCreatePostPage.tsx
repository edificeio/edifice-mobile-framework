import * as React from "react";
import I18n from "i18n-js";
import { connect } from "react-redux";
import style from "glamorous-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import InputScrollView from 'react-native-input-scroll-view';

import { alternativeNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderBackAction, HeaderAction } from "../../ui/headers/NewHeader";
import { PageContainer } from "../../myAppMenu/components/NewContainerContent";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { View, KeyboardAvoidingView } from "react-native";
import { Avatar, Size } from "../../ui/avatars/Avatar";
import { IBlog } from "../state/publishableBlogs";
import { IUserInfoState } from "../../user/state/info";
import { TextBold, TextLight } from "../../ui/text";
import { TextInput, ScrollView } from "react-native-gesture-handler";
import { ThunkDispatch } from "redux-thunk";
import { CommonStyles } from "../../styles/common/styles";
import { GridAvatars } from "../../ui/avatars/GridAvatars";
import { publishBlogPostAction } from "../actions/publish";

export interface IBlogCreatePostDataProps {
  user: IUserInfoState;
  publishing: boolean;
}

export interface IBlogCreatePostEventProps {
  onPublish: (blog: IBlog, post: string) => void;
}

export interface IBlogCreatePostOtherProps {
  navigation: NavigationScreenProp<NavigationState>;
}

export interface IBlogCreatePostState {
  content: string;
}

export type IBlogCreatePostPageProps = IBlogCreatePostDataProps & IBlogCreatePostEventProps & IBlogCreatePostOtherProps;

export class BlogCreatePostPage_Unconnected extends React.PureComponent<IBlogCreatePostPageProps, IBlogCreatePostState> {

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<NavigationState> }) => {
    return alternativeNavScreenOptions(
      {
        title: I18n.t("blog-newPost"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: <HeaderAction
          navigation={navigation}
          title={I18n.t('blog-publishAction')}
          onPress={() => navigation.getParam('onPublishPost') && navigation.getParam('onPublishPost')()}
          disabled={navigation.getParam('publishing', false)}
        />
      },
      navigation
    );
  };

  constructor(props: IBlogCreatePostPageProps) {
    super(props);
    this.state = {
      content: ''
    }
    this.props.navigation.setParams({
      onPublishPost: this.handlePublishPost.bind(this)
    })
  }

  render() {
    return <PageContainer>
      <KeyboardAvoidingView>
        <ConnectionTrackingBar />
        <View style={{
          paddingHorizontal: 20,
          paddingVertical: 20,
          flexDirection: "row",
          justifyContent: "center",
          flex: 0
        }}>
          <View style={{
            justifyContent: "center",
            width: 45,
            height: 45
          }}>
            <GridAvatars users={[this.props.user.id!]} />
          </View>
          <View style={{
            alignItems: "flex-start",
            flex: 1,
            justifyContent: "center",
            marginHorizontal: 6,
            padding: 2
          }}>
            <TextBold>{this.props.user.displayName}</TextBold>
            <TextLight numberOfLines={1}>{(this.props.navigation.getParam('blog') as IBlog)?.title}</TextLight>
          </View>
        </View>
        <InputScrollView style={{ flex: 0 }}>
          <TextInput
            style={{
              paddingHorizontal: 20,
              paddingVertical: 20,
              flex: 1,
              marginBottom: 50
            }}
            placeholder={I18n.t('postCreatePlaceholder')}
            multiline
            textAlignVertical="top"
            value={this.state.content}
            onChangeText={text => {
              this.setState({ content: text });
            }}
          />
        </InputScrollView>
      </KeyboardAvoidingView>
    </PageContainer>
  }

  componentDidUpdate(prevProps: IBlogCreatePostPageProps) {
    if (prevProps.publishing !== this.props.publishing) {
      this.props.navigation.setParams({'publishing': this.props.publishing});
    }
  }

  handlePublishPost() {
    this.props.onPublish(this.props.navigation.getParam('blog') as IBlog, this.state.content);
  }

}

export default connect(
  (state: any) => ({
    user: state.user.info,
    publishing: state.timeline.publishStatus.publishing
  }),
  (dispatch: ThunkDispatch<any, any, any>) => ({
    onPublish: (blog: IBlog, post: string) => {
      dispatch(publishBlogPostAction(blog, post));
    }
  })
)(BlogCreatePostPage_Unconnected);
