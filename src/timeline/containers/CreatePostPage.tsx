import * as React from "react";
import I18n from "i18n-js";
import { connect } from "react-redux";
import style from "glamorous-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import InputScrollView from 'react-native-input-scroll-view';
import listenToKeyboardEvents from 'react-native-keyboard-aware-scroll-view/lib/KeyboardAwareHOC';

import { alternativeNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderBackAction, HeaderAction } from "../../ui/headers/NewHeader";
import { PageContainer } from "../../myAppMenu/components/NewContainerContent";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { View, KeyboardAvoidingView, Platform, Keyboard, Text } from "react-native";
import { Avatar, Size } from "../../ui/avatars/Avatar";
import { IBlog } from "../state/publishableBlogs";
import { IUserInfoState } from "../../user/state/info";
import { TextBold, TextLight } from "../../ui/text";
import { TextInput, ScrollView, TouchableWithoutFeedback } from "react-native-gesture-handler";
import { ThunkDispatch } from "redux-thunk";
import { CommonStyles } from "../../styles/common/styles";
import { GridAvatars } from "../../ui/avatars/GridAvatars";
import { publishBlogPostAction } from "../actions/publish";
import { hasNotch } from "react-native-device-info";

export interface ICreatePostDataProps {
  user: IUserInfoState;
  publishing: boolean;
}

export interface ICreatePostEventProps {
  onPublish: (blog: IBlog, title: string, content: string) => void;
}

export interface ICreatePostOtherProps {
  navigation: NavigationScreenProp<NavigationState>;
}

export interface ICreatePostState {
  title: string;
  content: string;
}

export type ICreatePostPageProps = ICreatePostDataProps & ICreatePostEventProps & ICreatePostOtherProps;

export class CreatePostPage_Unconnected extends React.PureComponent<ICreatePostPageProps, ICreatePostState> {

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<NavigationState> }) => {
    return alternativeNavScreenOptions(
      {
        title: I18n.t(`createPost-newPost-${navigation.getParam("postType")}`),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: <HeaderAction
          navigation={navigation}
          title={I18n.t('createPost-publishAction')}
          onPress={() => navigation.getParam('onPublishPost') && navigation.getParam('onPublishPost')()}
          disabled={
            navigation.getParam('publishing', false)
            || navigation.getParam('title', '').length === 0
            || navigation.getParam('content', '').length === 0
          }
        />
      },
      navigation
    );
  };

  constructor(props: ICreatePostPageProps) {
    super(props);
    this.state = {
      title: '',
      content: ''
    }
    this.props.navigation.setParams({
      onPublishPost: this.handlePublishPost.bind(this)
    })
  }

  render() {
    return <KeyboardAvoidingView
      enabled
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? hasNotch() ? 100 : 76 : undefined} // 🍔 Big-(M)Hack of the death : On iOS KeyboardAvoidingView not working properly.
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ height: '100%' }}>
        <PageContainer style={{ flex: 1 }}>
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

          <TextBold style={{ paddingHorizontal: 20 }}>{I18n.t('createPost-create-titleField')}</TextBold>
          <TextInput
            numberOfLines={1}
            placeholder={I18n.t('createPost-create-titlePlaceholder')}
            value={this.state.title}
            onChangeText={text => {
              this.setState({ title: text });
              this.props.navigation.setParams({ title: text })
            }}
            style={{
              marginHorizontal: 20,
              marginTop: 10, marginBottom: 20,
              padding: 5,
              backgroundColor: CommonStyles.tabBottomColor,
              borderColor: CommonStyles.borderBottomItem,
              borderWidth: 1,
              borderRadius: 1
            }}
          />

          <TextBold style={{ paddingHorizontal: 20 }}>{I18n.t('createPost-create-contentField')}</TextBold>
          <TextInput
            style={{
              marginHorizontal: 20,
              marginTop: 10, marginBottom: 20,
              padding: 5,
              flex: 1,
              backgroundColor: CommonStyles.tabBottomColor,
              borderColor: CommonStyles.borderBottomItem,
              borderWidth: 1,
              borderRadius: 1
            }}
            placeholder={I18n.t('createPost-create-contentPlaceholder')}
            multiline
            textAlignVertical="top"
            value={this.state.content}
            onChangeText={text => {
              this.setState({ content: text });
              this.props.navigation.setParams({ content: text })
            }}
          />

        </PageContainer>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  }

  componentDidUpdate(prevProps: ICreatePostPageProps) {
    if (prevProps.publishing !== this.props.publishing) {
      this.props.navigation.setParams({ 'publishing': this.props.publishing });
    }
  }

  handlePublishPost() {
    this.props.onPublish(
      this.props.navigation.getParam('blog') as IBlog,
      this.state.title,
      this.state.content
    );
  }

}

export default connect(
  (state: any) => ({
    user: state.user.info,
    publishing: state.timeline.publishStatus.publishing
  }),
  (dispatch: ThunkDispatch<any, any, any>) => ({
    onPublish: (blog: IBlog, title: string, content: string) => {
      dispatch(publishBlogPostAction(blog, title, content));
    }
  })
)(CreatePostPage_Unconnected);
