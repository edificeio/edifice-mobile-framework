import * as React from 'react';
import I18n from 'i18n-js';
import { connect } from 'react-redux';
import { NavigationScreenProp, NavigationState } from 'react-navigation';
import { hasNotch } from 'react-native-device-info';
import { ThunkDispatch } from 'redux-thunk';
import { TextInput, TouchableWithoutFeedback, TouchableOpacity } from 'react-native-gesture-handler';
import { View, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';

import { Icon, Loading } from '../../ui';
import { HeaderBackAction, HeaderAction } from '../../ui/headers/NewHeader';
import { GridAvatars } from '../../ui/avatars/GridAvatars';
import { TextBold, TextLight } from '../../framework/components/text';
import DEPRECATED_ConnectionTrackingBar from '../../ui/ConnectionTrackingBar';
import { A } from '../../ui/Typography';
import { alternativeNavScreenOptions } from '../../navigation/helpers/navScreenOptions';
import { PageContainer } from '../../myAppMenu/components/NewContainerContent';
import { IBlog } from '../state/publishableBlogs';
import { IUserInfoState } from '../../user/state/info';
import { CommonStyles } from '../../styles/common/styles';
import { publishBlogPostAction } from '../actions/publish';
import { ContentUri } from '../../types/contentUri';
import { uploadDocument, formatResults } from '../../workspace/actions/helpers/documents';
import { FilterId } from '../../workspace/types';
import { resourceHasRight } from '../../utils/resourceRights';
import withViewTracking from '../../infra/tracker/withViewTracking';
import { AttachmentPicker } from '../../ui/AttachmentPicker';
import Notifier from '../../infra/notifier/container';
import { ImagePicked, ImagePicker } from '../../infra/imagePicker';
import { ImagePickerResponse } from 'react-native-image-picker';

export interface ICreatePostDataProps {
  user: IUserInfoState;
  publishing: boolean;
  workspaceItems: object;
}

export interface ICreatePostEventProps {
  onUploadPostDocuments: (images: ContentUri[]) => void;
  onPublishPost: (blog: IBlog, title: string, content: string, uploadedPostDocuments?: object) => void;
}

export interface ICreatePostOtherProps {
  navigation: NavigationScreenProp<NavigationState>;
}

export interface ICreatePostState {
  title: string;
  content: string;
  images: ImagePicked[];
}

export type ICreatePostPageProps = ICreatePostDataProps & ICreatePostEventProps & ICreatePostOtherProps;

export class CreatePostPage_Unconnected extends React.PureComponent<ICreatePostPageProps, ICreatePostState> {
  constructor(props: ICreatePostPageProps) {
    super(props);
    this.state = {
      title: '',
      content: '',
      images: [],
    };
    this.props.navigation.setParams({
      onPublishPost: this.handlePublishPost.bind(this),
      userinfo: this.props.user,
    });
  }

  public attachmentPickerRef: any;

  render() {
    const { title, content, images } = this.state;
    const { user, navigation } = this.props;
    const imagesAdded = images.length > 0;

    return (
      <PageContainer style={{ flex: 1 }}>
        <Notifier id="createPost" />
        <KeyboardAvoidingView
          enabled
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? (hasNotch() ? 100 : 76) : undefined} // 🍔 Big-(M)Hack of the death : On iOS KeyboardAvoidingView not working properly.
          style={{ flex: 1 }}>
          <ScrollView alwaysBounceVertical={false} contentContainerStyle={{ flexGrow: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ height: '100%' }}>
              <DEPRECATED_ConnectionTrackingBar />
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 20,
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    justifyContent: 'center',
                    width: 45,
                    height: 45,
                  }}>
                  <GridAvatars users={[user.id!]} />
                </View>
                <View
                  style={{
                    alignItems: 'flex-start',
                    flex: 1,
                    justifyContent: 'center',
                    marginHorizontal: 6,
                    padding: 2,
                  }}>
                  <TextBold>{user.displayName}</TextBold>
                  <TextLight numberOfLines={1}>{(navigation.getParam('blog') as IBlog)?.title}</TextLight>
                </View>
              </View>

              <TextBold style={{ paddingHorizontal: 20 }}>{I18n.t('createPost-create-titleField')}</TextBold>
              <TextInput
                numberOfLines={1}
                placeholder={I18n.t('createPost-create-titlePlaceholder')}
                value={title}
                onChangeText={text => {
                  this.setState({ title: text });
                  navigation.setParams({ title: text });
                }}
                style={{
                  marginHorizontal: 20,
                  marginTop: 10,
                  marginBottom: 20,
                  padding: 10,
                  backgroundColor: CommonStyles.tabBottomColor,
                  borderColor: CommonStyles.borderBottomItem,
                  borderWidth: 1,
                  borderRadius: 5,
                }}
              />

              <TextBold style={{ paddingLeft: 20, paddingRight: 10 }}>{I18n.t('createPost-create-contentField')}</TextBold>
              <TextInput
                style={{
                  marginHorizontal: 20,
                  marginTop: 10,
                  marginBottom: 20,
                  padding: 10,
                  backgroundColor: CommonStyles.tabBottomColor,
                  borderColor: CommonStyles.borderBottomItem,
                  borderWidth: 1,
                  borderRadius: 5,
                  height: 140,
                }}
                placeholder={I18n.t('createPost-create-contentPlaceholder')}
                multiline
                textAlignVertical="top"
                value={content}
                onChangeText={text => {
                  this.setState({ content: text });
                  navigation.setParams({ content: text });
                }}
              />

              <View
                style={{
                  marginHorizontal: 20,
                  marginTop: 10,
                  marginBottom: 20,
                  padding: 10,
                  backgroundColor: CommonStyles.tabBottomColor,
                  borderColor: CommonStyles.borderBottomItem,
                  borderWidth: 1,
                  borderRadius: 5,
                  justifyContent: 'center',
                }}>
                <ImagePicker
                  callback={image => {
                    console.log('image', image);
                    this.setState({ images: [...images, image] });
                  }}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: imagesAdded ? 'row' : 'column',
                      marginVertical: 10,
                    }}
                    // onPress={() => this.attachmentPickerRef.onPickAttachment()}
                  >
                    <A style={{ backgroundColor: 'red', flex: 1, marginRight: imagesAdded ? 5 : 0 }}>
                      {I18n.t('createPost-create-mediaField')}
                    </A>
                    <Icon name="camera-on" size={imagesAdded ? 15 : 22} color={CommonStyles.actionColor} />
                  </View>
                </ImagePicker>
                <AttachmentPicker
                  ref={r => (this.attachmentPickerRef = r)}
                  onlyImages
                  attachments={images}
                  onAttachmentRemoved={imagesToSend => {
                    this.setState({ images: imagesToSend });
                  }}
                  notifierId="createPost"
                />
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </PageContainer>
    );
  }

  componentDidUpdate(prevProps: ICreatePostPageProps) {
    const { publishing, navigation, user } = this.props;
    if (prevProps.publishing !== publishing) {
      navigation.setParams({ publishing: publishing });
    }
  }

  async handlePublishPost() {
    const { onPublishPost, onUploadPostDocuments, navigation } = this.props;
    const { title, content, images } = this.state;

    let uploadedPostDocuments = undefined;
    if (images.length > 0) {
      navigation.setParams({ uploadingPostDocuments: true });
      const convertedImages: ContentUri[] = images.map(i => ({
        mime: i.type,
        name: i.fileName,
        uri: i.uri,
        path: i.uri,
      }));
      uploadedPostDocuments = await onUploadPostDocuments(convertedImages);
    }

    onPublishPost(navigation.getParam('blog') as IBlog, title, content, uploadedPostDocuments);
  }
}

const uploadActionTimeline = images => async dispatch => {
  const response = await uploadDocument(dispatch, images, FilterId.protected);
  const data = response.map(item => JSON.parse(item));
  return formatResults(data);
};

const CreatePostPage = connect(
  (state: any) => ({
    user: state.user.info,
    publishing: state.timeline.publishStatus.publishing,
  }),
  (dispatch: ThunkDispatch<any, any, any>) => ({
    onUploadPostDocuments: async (images: ContentUri[]) => dispatch(uploadActionTimeline(images)),
    onPublishPost: (blog: IBlog, title: string, content: string, uploadedPostDocuments?: object) => {
      dispatch(publishBlogPostAction(blog, title, content, uploadedPostDocuments));
    },
  }),
)(CreatePostPage_Unconnected);

const CreatePostPageOK = withViewTracking('timeline/create/blog/content')(CreatePostPage);

CreatePostPageOK.navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<NavigationState> }) => {
  return alternativeNavScreenOptions(
    {
      title: I18n.t(`createPost-newPost-${navigation.getParam('postType')}`),
      headerLeft: <HeaderBackAction navigation={navigation} />,
      headerRight: navigation.getParam('uploadingPostDocuments') ? (
        <Loading small customColor={CommonStyles.lightGrey} customStyle={{ paddingHorizontal: 18 }} />
      ) : (
        <HeaderAction
          navigation={navigation}
          title={
            navigation.getParam('blog') && navigation.getParam('userinfo')
              ? (navigation.getParam('blog') as IBlog)['publish-type']
                ? (navigation.getParam('blog') as IBlog)['publish-type'] === 'IMMEDIATE' ||
                  resourceHasRight(
                    navigation.getParam('blog') as IBlog,
                    'org-entcore-blog-controllers-PostController|submit',
                    navigation.getParam('userinfo'),
                  )
                  ? I18n.t('createPost-publishAction')
                  : I18n.t('createPost-submitAction')
                : ''
              : ''
          }
          onPress={() => navigation.getParam('onPublishPost') && navigation.getParam('onPublishPost')()}
          disabled={
            navigation.getParam('publishing', false) ||
            navigation.getParam('title', '').length === 0 ||
            navigation.getParam('content', '').length === 0
          }
        />
      ),
    },
    navigation,
  );
};

export default CreatePostPageOK;
