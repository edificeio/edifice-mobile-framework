import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, Keyboard, ScrollView, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { NavigationActions, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { HeaderAction } from '~/framework/components/header';
import { Icon } from '~/framework/components/icon';
import { LoadingIndicator } from '~/framework/components/loading';
import { ImagePicked, cameraAction, galleryAction, imagePickedToLocalFile } from '~/framework/components/menus/actions';
import BottomMenu from '~/framework/components/menus/bottom';
import { KeyboardPageView } from '~/framework/components/page';
import { SmallActionText, SmallBoldText, SmallText } from '~/framework/components/text';
import { startLoadNotificationsAction } from '~/framework/modules/timelinev2/actions';
import { SyncedFile } from '~/framework/util/fileHandler';
import Notifier from '~/framework/util/notifier';
import { notifierShowAction } from '~/framework/util/notifier/actions';
import { IUserSession, getUserSession } from '~/framework/util/session';
import { Trackers } from '~/framework/util/tracker';
import { sendBlogPostAction, uploadBlogPostImagesAction } from '~/modules/blog/actions';
import { IBlog } from '~/modules/blog/reducer';
import {
  createBlogPostResourceRight,
  getBlogPostRight,
  publishBlogPostResourceRight,
  submitBlogPostResourceRight,
} from '~/modules/blog/rights';
import { ILocalAttachment } from '~/ui/Attachment';
import { AttachmentPicker } from '~/ui/AttachmentPicker';
import { GridAvatars } from '~/ui/avatars/GridAvatars';

// TYPES ==========================================================================================

export interface IBlogCreatePostScreenDataProps {
  session: IUserSession;
}
export interface IBlogCreatePostScreenEventProps {
  handleUploadPostImages(images: ImagePicked[]): Promise<SyncedFile[]>;
  handleSendBlogPost(blog: IBlog, title: string, content: string, uploadedPostImages?: SyncedFile[]): Promise<string | undefined>;
  handleInitTimeline(): Promise<void>;
  dispatch: ThunkDispatch<any, any, any>;
}
export interface IBlogCreatePostScreenNavParams {
  blog: IBlog;
  referrer?: string;
}
export type IBlogCreatePostScreenProps = IBlogCreatePostScreenDataProps &
  IBlogCreatePostScreenEventProps &
  NavigationInjectedProps<Partial<IBlogCreatePostScreenNavParams>>;

export interface IBlogCreatePostScreenState {
  sendLoadingState: boolean;
  title: string;
  content: string;
  images: ImagePicked[];
}

// COMPONENT ======================================================================================

export class BlogCreatePostScreen extends React.PureComponent<IBlogCreatePostScreenProps, IBlogCreatePostScreenState> {
  // DECLARATIONS =================================================================================

  state: IBlogCreatePostScreenState = {
    sendLoadingState: false,
    title: '',
    content: '',
    images: [],
  };

  attachmentPickerRef: any;

  // NAVBAR =======================================================================================

  navBarInfo = () => {
    const blog = this.props.navigation.getParam('blog');
    const blogPostRight = blog && this.props.session && getBlogPostRight(blog, this.props.session);
    const blogPostDisplayRight = blogPostRight && blogPostRight.displayRight;
    const actionText =
      blogPostDisplayRight &&
      {
        [createBlogPostResourceRight]: I18n.t('blog.blogCreatePostScreen.createAction'),
        [submitBlogPostResourceRight]: I18n.t('blog.blogCreatePostScreen.submitAction'),
        [publishBlogPostResourceRight]: I18n.t('blog.blogCreatePostScreen.publishAction'),
      }[blogPostDisplayRight];
    return {
      title: I18n.t('blog.blogCreatePostScreen.title'),
      right: this.state.sendLoadingState ? (
        <LoadingIndicator
          small
          customColor={theme.ui.text.inverse}
          customStyle={{ justifyContent: 'center', paddingHorizontal: UI_SIZES.spacing.big }}
        />
      ) : (
        <HeaderAction
          text={actionText}
          disabled={this.state.title.length === 0 || this.state.content.length === 0}
          onPress={() => this.doSend()}
        />
      ),
    };
  };

  // RENDER =======================================================================================

  render() {
    return (
      <KeyboardPageView
        navigation={this.props.navigation}
        navBarWithBack={this.navBarInfo()}
        onBack={this.doHandleGoBack.bind(this)}
        scrollable={false}>
        <Notifier id="createPost" />
        {/* ToDo : don't use magic keywords like this. */}
        <ScrollView
          alwaysBounceVertical={false}
          overScrollMode="never"
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: UI_SIZES.spacing.small,
            paddingHorizontal: UI_SIZES.spacing.medium,
          }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>{this.renderContent()}</TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardPageView>
    );
  }

  renderError() {
    return <SmallBoldText>Error</SmallBoldText>; // ToDo: great error screen here
  }

  renderContent() {
    return (
      <>
        {this.renderBlogInfos()}
        {this.renderPostInfos()}
        {this.renderPostMedia()}
      </>
    );
  }

  renderBlogInfos() {
    const { navigation, session } = this.props;
    const { id, displayName } = session.user;
    const blog = navigation.getParam('blog');
    return (
      <View style={{ marginBottom: UI_SIZES.spacing.big, flexDirection: 'row', alignItems: 'center' }}>
        <GridAvatars users={[id]} />
        <View style={{ flex: 1, justifyContent: 'center', marginLeft: UI_SIZES.spacing.minor }}>
          <SmallBoldText>{displayName}</SmallBoldText>
          <SmallText>{blog?.title}</SmallText>
        </View>
      </View>
    );
  }

  renderPostInfos() {
    const { title, content } = this.state;
    return (
      <>
        <SmallBoldText style={{ marginBottom: UI_SIZES.spacing.small }}>
          {I18n.t('blog.blogCreatePostScreen.postTitle')}
        </SmallBoldText>
        <TextInput
          placeholder={I18n.t('blog.blogCreatePostScreen.postTitlePlaceholder')}
          value={title}
          onChangeText={text => this.setState({ title: text })}
          style={{
            marginBottom: UI_SIZES.spacing.big,
            padding: UI_SIZES.spacing.small,
            backgroundColor: theme.ui.background.card,
            borderColor: theme.ui.border.input,
            borderWidth: 1,
            borderRadius: 5,
            color: theme.ui.text.regular,
          }}
        />
        <SmallBoldText style={{ marginBottom: UI_SIZES.spacing.small }}>
          {I18n.t('blog.blogCreatePostScreen.postContent')}
        </SmallBoldText>
        <TextInput
          placeholder={I18n.t('blog.blogCreatePostScreen.postContentPlaceholder')}
          value={content}
          onChangeText={text => this.setState({ content: text })}
          style={{
            marginBottom: UI_SIZES.spacing.medium,
            padding: UI_SIZES.spacing.small,
            backgroundColor: theme.ui.background.card,
            borderColor: theme.ui.border.input,
            borderWidth: 1,
            borderRadius: 5,
            height: 140,
            color: theme.ui.text.regular,
          }}
          textAlignVertical="top"
          multiline
        />
      </>
    );
  }

  imageCallback = image => {
    this.setState(prevState => ({ images: [...prevState.images, image] }));
  };

  renderPostMedia() {
    const { images } = this.state;
    const imagesAdded = images.length > 0;
    return (
      <View
        style={{
          backgroundColor: theme.ui.background.card,
          borderColor: theme.ui.border.input,
          borderWidth: 1,
          borderRadius: 5,
        }}>
        <BottomMenu
          title={I18n.t('bottom-menu-add-media')}
          actions={[
            cameraAction({
              callback: this.imageCallback,
            }),
            galleryAction({
              callback: this.imageCallback,
              multiple: true,
            }),
          ]}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: imagesAdded ? 'row' : 'column',
              marginTop: UI_SIZES.spacing.big,
              marginBottom: imagesAdded ? UI_SIZES.spacing.small : UI_SIZES.spacing.big,
            }}
            // onPress={() => this.attachmentPickerRef.onPickAttachment()}
          >
            <SmallActionText style={{ width: 300, marginRight: imagesAdded ? UI_SIZES.spacing.minor : 0, textAlign: 'center' }}>
              {I18n.t('createPost-create-mediaField')}
            </SmallActionText>
            <Icon name="camera-on" size={imagesAdded ? 15 : 22} color={theme.palette.primary.regular} />
          </View>
        </BottomMenu>
        <AttachmentPicker
          ref={r => (this.attachmentPickerRef = r)}
          onlyImages
          attachments={images.map(
            img =>
              ({
                mime: img.type,
                name: img.fileName,
                uri: img.uri,
              } as ILocalAttachment),
          )}
          onAttachmentSelected={() => {}}
          onAttachmentRemoved={imagesToSend => this.setState({ images: imagesToSend })}
          notifierId="createBlogPost"
        />
      </View>
    );
  }

  // METHODS ======================================================================================

  doHandleGoBack() {
    const { navigation } = this.props;
    const { content, title, images } = this.state;
    const isCreatingPost = content || title || images.length;
    if (isCreatingPost) {
      Alert.alert(
        I18n.t('common.confirmationUnsavedPublication'),
        I18n.t('blog.blogCreatePostScreen.confirmationUnsavedPublication'),
        [
          {
            text: I18n.t('common.quit'),
            onPress: () => navigation.dispatch(NavigationActions.back()),
            style: 'destructive',
          },
          {
            text: I18n.t('common.continue'),
            style: 'default',
          },
        ],
      );
    } else return true;
  }

  async doSend() {
    Keyboard.dismiss();
    try {
      this.setState({ sendLoadingState: true });
      await this.doSendPost();
    } finally {
      this.setState({ sendLoadingState: false });
    }
  }

  async doSendPost() {
    try {
      const { navigation, session, handleUploadPostImages, handleSendBlogPost, handleInitTimeline, dispatch } = this.props;
      const { title, content, images } = this.state;
      const blog = navigation.getParam('blog');
      const blogId = blog && blog.id;
      if (!blog || !blogId) {
        throw new Error('[doSendPost] failed to retrieve blog information');
      }
      const blogPostRight = blog && session && getBlogPostRight(blog, session);
      if (!blogPostRight) {
        throw new Error('[doSendPost] user has no post rights for this blog');
      }

      // Upload post images (if added)
      let uploadedPostImages: undefined | SyncedFile[];
      if (images.length > 0) {
        uploadedPostImages = await handleUploadPostImages(images);
      }

      // Translate entered content to httml
      const htmlContent = content.replace(/\n/g, '<br>');

      // Create and submit/publish post
      await handleSendBlogPost(blog, title, htmlContent, uploadedPostImages);

      // Track action, load/navigate to timeline and display notifier
      const blogPostDisplayRight = blogPostRight.displayRight;
      const event = {
        [createBlogPostResourceRight]: 'Enregistrer',
        [submitBlogPostResourceRight]: 'Soumettre',
        [publishBlogPostResourceRight]: 'Publier',
      }[blogPostDisplayRight];
      const eventName = `Rédaction blog - ${event}`;
      const eventCategory = navigation.getParam('referrer') ? 'Blog' : 'Timeline';
      const notifierSuccessText = {
        [createBlogPostResourceRight]: I18n.t('blog.blogCreatePostScreen.createSuccess'),
        [submitBlogPostResourceRight]: I18n.t('blog.blogCreatePostScreen.submitSuccess'),
        [publishBlogPostResourceRight]: I18n.t('blog.blogCreatePostScreen.publishSuccess'),
      }[blogPostDisplayRight];

      Trackers.trackEvent(eventCategory, 'Créer un billet', eventName);
      await handleInitTimeline();
      navigation.navigate(navigation.getParam('referrer', 'timeline'));
      dispatch(
        notifierShowAction({
          id: navigation.getParam('referrer', 'timeline'),
          text: notifierSuccessText,
          icon: 'checked',
          type: 'success',
          duration: 8000,
        }),
      );
    } catch (e) {
      if (e.response.body === '{"error":"file.too.large"}') {
        Toast.show(I18n.t('fullStorage'), {
          position: Toast.position.BOTTOM,
          ...UI_ANIMATIONS.toast,
        });
      }
      const { dispatch } = this.props;
      dispatch(
        notifierShowAction({
          id: 'blog/create',
          text: `${I18n.t('common.error.title')} ${I18n.t('common.error.text')}`,
          icon: 'close',
          type: 'error',
        }),
      );
    }
  }
}

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => IBlogCreatePostScreenDataProps = s => {
  return {
    session: getUserSession(),
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>) => IBlogCreatePostScreenEventProps = dispatch => ({
  handleUploadPostImages: async (images: ImagePicked[]) => {
    const localFiles = images.map(img => imagePickedToLocalFile(img));
    return dispatch(uploadBlogPostImagesAction(localFiles)) as unknown as Promise<SyncedFile[]>;
  },
  handleSendBlogPost: async (blog: IBlog, title: string, content: string, uploadedPostImages?: SyncedFile[]) => {
    return (await dispatch(sendBlogPostAction(blog, title, content, uploadedPostImages))) as unknown as string | undefined;
  },
  handleInitTimeline: async () => {
    await dispatch(startLoadNotificationsAction());
  },
  dispatch,
});

const BlogCreatePostScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(BlogCreatePostScreen);
export default BlogCreatePostScreen_Connected;
