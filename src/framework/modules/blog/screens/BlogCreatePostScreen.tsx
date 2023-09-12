import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { Alert, Keyboard, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import InputContainer from '~/framework/components/inputs/container';
import MultilineTextInput from '~/framework/components/inputs/multiline';
import { RichTextEditor, RichTextEditorMode } from '~/framework/components/inputs/rich-text-editor';
import TextInput from '~/framework/components/inputs/text';
import { ImagePicked, imagePickedToLocalFile } from '~/framework/components/menus/actions';
import { KeyboardPageView } from '~/framework/components/page';
import { NamedSVG } from '~/framework/components/picture';
import { BodyText, SmallBoldText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import usePreventBack from '~/framework/hooks/usePreventBack';
import { ISession } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { sendBlogPostAction, uploadBlogPostImagesAction } from '~/framework/modules/blog/actions';
import moduleConfig from '~/framework/modules/blog/module-config';
import { BlogNavigationParams, blogRouteNames } from '~/framework/modules/blog/navigation';
import { Blog } from '~/framework/modules/blog/reducer';
import {
  createBlogPostResourceRight,
  getBlogPostRight,
  publishBlogPostResourceRight,
  submitBlogPostResourceRight,
} from '~/framework/modules/blog/rights';
import { startLoadNotificationsAction } from '~/framework/modules/timeline/actions';
import { timelineRouteNames } from '~/framework/modules/timeline/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { SyncedFile } from '~/framework/util/fileHandler';
import { Image } from '~/framework/util/media';
import { isEmpty } from '~/framework/util/object';
import { uppercaseFirstLetter } from '~/framework/util/string';
import { Trackers } from '~/framework/util/tracker';
import { ILocalAttachment } from '~/ui/Attachment';
import { AttachmentPicker } from '~/ui/AttachmentPicker';

export interface BlogCreatePostScreenDataProps {
  session?: ISession;
}

export interface BlogCreatePostScreenEventProps {
  handleUploadPostImages(images: ImagePicked[]): Promise<SyncedFile[]>;
  handleSendBlogPost(blog: Blog, title: string, content: string, uploadedPostImages?: SyncedFile[]): Promise<string | undefined>;
  handleInitTimeline(): Promise<void>;
  dispatch: ThunkDispatch<any, any, any>;
}

export interface BlogCreatePostScreenNavParams {
  blog: Blog;
  referrer?: string;
}

export type BlogCreatePostScreenProps = BlogCreatePostScreenDataProps &
  BlogCreatePostScreenEventProps &
  NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogCreatePost>;

export interface BlogCreatePostScreenState {
  sendLoadingState: boolean;
  title: string;
  content: string;
  images: ImagePicked[] | ILocalAttachment[];
  thumbnailBlog: string | undefined;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: theme.palette.grey.white,
  },
  scrollView: {
    flexGrow: 1,
    padding: UI_SIZES.spacing.medium,
  },
  userInfos: {
    marginBottom: UI_SIZES.spacing.large,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailBlog: {
    width: UI_SIZES.elements.avatar.lg,
    aspectRatio: UI_SIZES.aspectRatios.square,
    borderRadius: UI_SIZES.radius.medium,
  },
  thumbnailNoBlog: {
    backgroundColor: theme.palette.complementary.indigo.pale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blogTitle: {
    color: theme.palette.grey.darkness,
    marginLeft: UI_SIZES.spacing.minor,
  },
  input: {
    marginBottom: UI_SIZES.spacing.big,
  },
  button: {
    marginTop: UI_SIZES.spacing.large,
  },
});

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<BlogNavigationParams, typeof blogRouteNames.blogCreatePost>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('blog-createpost-title'),
    titleStyle: { width: undefined },
  }),
});

function PreventBack(props: { isEditing: boolean }) {
  usePreventBack({
    title: I18n.get('blog-createpost-confirmation-unsavedpublication'),
    text: I18n.get('blog-createpost-unsavedpublication'),
    showAlert: props.isEditing,
  });
  return null;
}

export class BlogCreatePostScreen extends React.PureComponent<BlogCreatePostScreenProps, BlogCreatePostScreenState> {
  state: BlogCreatePostScreenState = {
    sendLoadingState: false,
    title: '',
    content: '',
    images: [],
    thumbnailBlog: this.props.route.params.blog.thumbnail,
  };

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
      const { route, navigation, session, handleUploadPostImages, handleSendBlogPost, handleInitTimeline, dispatch } = this.props;
      const { title, content, images } = this.state;
      const blog = route.params.blog;
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
        try {
          uploadedPostImages = await handleUploadPostImages(images);
        } catch (e: any) {
          // Full storage management
          // statusCode = 400 on iOS and code = 'ENOENT' on Android
          if (e.response?.statusCode === 400 || e.code === 'ENOENT') {
            Alert.alert('', I18n.get('blog-createpost-fullstorage'));
          } else {
            Alert.alert('', I18n.get('blog-createpost-uploadattachments-error-text'));
          }
          throw new Error('handled');
        }
      }

      // Translate entered content to httml
      const htmlContent = content.replace(/\n/g, '<br>').trim();

      // Create and submit/publish post
      await handleSendBlogPost(blog, title.trim(), htmlContent, uploadedPostImages);

      // Track action, load/navigate to timeline and display toast
      const blogPostDisplayRight = blogPostRight.displayRight;
      const event = {
        [createBlogPostResourceRight]: 'Enregistrer',
        [submitBlogPostResourceRight]: 'Soumettre',
        [publishBlogPostResourceRight]: 'Publier',
      }[blogPostDisplayRight];
      const eventName = `Rédaction blog - ${event}`;
      const eventCategory = route.params.referrer ? 'Blog' : 'Timeline';
      const toastSuccessText = {
        [createBlogPostResourceRight]: I18n.get('blog-createpost-create-success'),
        [submitBlogPostResourceRight]: I18n.get('blog-createpost-submit-success'),
        [publishBlogPostResourceRight]: I18n.get('blog-createpost-publish-success'),
      }[blogPostDisplayRight];

      Trackers.trackEvent(eventCategory, 'Créer un billet', eventName);
      await handleInitTimeline();
      navigation.navigate(route.params.referrer ?? timelineRouteNames.Home, {
        ...(route.params.referrer ? { selectedBlog: route.params.blog } : {}),
      });
      Toast.showSuccess(toastSuccessText);
    } catch (e: any) {
      if (e.response?.body === '{"error":"file.too.large"}') {
        Toast.showError(I18n.get('blog-createpost-fullstorage'));
      }
      if ((e as Error).message && (e as Error).message !== 'handled') {
        Toast.showError(I18n.get('blog-createpost-publish-error-text'));
      }
    }
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
        {this.renderButton()}
      </>
    );
  }

  renderThumbnail() {
    const { route } = this.props;
    const blog = route.params.blog;
    if (this.state.thumbnailBlog)
      return (
        <View>
          <Image
            source={blog?.thumbnail}
            style={styles.thumbnailBlog}
            onError={() => this.setState({ thumbnailBlog: undefined })}
          />
        </View>
      );
    return (
      <View style={[styles.thumbnailBlog, styles.thumbnailNoBlog]}>
        <NamedSVG name="blog" fill={theme.palette.complementary.indigo.regular} height={32} width={32} />
      </View>
    );
  }

  renderBlogInfos() {
    const { route, session } = this.props;
    if (!session) return <View style={styles.userInfos} />;
    const blog = route.params.blog;
    return (
      <View style={styles.userInfos}>
        {this.renderThumbnail()}
        <BodyText style={styles.blogTitle}>{blog?.title}</BodyText>
      </View>
    );
  }

  renderPostInfos() {
    const { title, content } = this.state;
    return (
      <>
        <InputContainer
          label={{ text: I18n.get('blog-createpost-post-title'), icon: 'ui-write' }}
          input={
            <TextInput
              placeholder={I18n.get('blog-createpost-post-title-placeholder')}
              value={title}
              onChangeText={text => this.setState({ title: text })}
            />
          }
          style={styles.input}
        />
        <TouchableOpacity onPress={() => this.props.navigation.navigate(blogRouteNames.blogEditContentPost, {})}>
          <RichTextEditor content={null} mode={RichTextEditorMode.DISABLED} />
        </TouchableOpacity>

        <InputContainer
          label={{ text: I18n.get('blog-createpost-postcontent'), icon: 'ui-textPage' }}
          input={
            <MultilineTextInput
              placeholder={I18n.get('blog-createpost-postcontent-placeholder')}
              value={content}
              onChangeText={text => this.setState({ content: text })}
              numberOfLines={5}
            />
          }
          style={styles.input}
        />
      </>
    );
  }

  renderPostMedia() {
    const { images } = this.state;
    return (
      <View>
        <AttachmentPicker
          onlyImages
          notifierId={uppercaseFirstLetter(moduleConfig.name)}
          imageCallback={image => this.setState(prevState => ({ images: [...prevState.images, image] }))}
          onAttachmentRemoved={images => this.setState({ images })}
          attachments={images.map(image => ({
            mime: image.type,
            name: image.fileName,
            uri: image.uri,
          }))}
        />
      </View>
    );
  }

  renderButton() {
    const blog = this.props.route.params.blog;
    const blogPostRight = blog && this.props.session && getBlogPostRight(blog, this.props.session);
    const blogPostDisplayRight = blogPostRight && blogPostRight.displayRight;
    const actionText =
      blogPostDisplayRight &&
      {
        [createBlogPostResourceRight]: I18n.get('blog-createpost-create'),
        [submitBlogPostResourceRight]: I18n.get('blog-createpost-submit'),
        [publishBlogPostResourceRight]: I18n.get('blog-createpost-publish'),
      }[blogPostDisplayRight];
    return (
      <PrimaryButton
        text={actionText}
        loading={this.state.sendLoadingState}
        disabled={this.state.title.trim().length === 0 || this.state.content.trim().length === 0}
        action={() => this.doSend()}
        style={styles.button}
      />
    );
  }

  render() {
    const isEditing = !isEmpty(this.state.title || this.state.content || this.state.images) && !this.state.sendLoadingState;
    return (
      <>
        <PreventBack isEditing={isEditing} />
        <KeyboardPageView scrollable={false} style={styles.page}>
          {/* ToDo : don't use magic keywords like this. */}
          <ScrollView alwaysBounceVertical={false} overScrollMode="never" contentContainerStyle={styles.scrollView}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>{this.renderContent()}</TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardPageView>
      </>
    );
  }
}

const mapStateToProps: (s: IGlobalState) => BlogCreatePostScreenDataProps = s => {
  return {
    session: getSession(),
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>) => BlogCreatePostScreenEventProps = dispatch => ({
  handleUploadPostImages: async (images: ImagePicked[]) => {
    const localFiles = images.map(img => imagePickedToLocalFile(img));
    return dispatch(uploadBlogPostImagesAction(localFiles)) as unknown as Promise<SyncedFile[]>;
  },
  handleSendBlogPost: async (blog: Blog, title: string, content: string, uploadedPostImages?: SyncedFile[]) => {
    return (await dispatch(sendBlogPostAction(blog, title, content, uploadedPostImages))) as unknown as string | undefined;
  },
  handleInitTimeline: async () => {
    await dispatch(startLoadNotificationsAction());
  },
  dispatch,
});

const BlogCreatePostScreenConnected = connect(mapStateToProps, mapDispatchToProps)(BlogCreatePostScreen);
export default BlogCreatePostScreenConnected;
