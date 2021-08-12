import * as React from "react";
import {
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { ThunkDispatch } from "redux-thunk";
import { connect } from "react-redux";
import I18n from "i18n-js";

import moduleConfig from "../moduleConfig";
import { PageView } from "../../../framework/components/page";
import { LoadingIndicator } from "../../../framework/components/loading";
import {
  FakeHeader,
  HeaderAction,
  HeaderCenter,
  HeaderLeft,
  HeaderRight,
  HeaderRow,
  HeaderTitle,
} from "../../../framework/components/header";
import { TextBold, TextSemiBold, TextLight, TextAction } from "../../../framework/components/text";
import { IGlobalState } from "../../../AppStore";
import { IBlog } from "../reducer";
import theme from "../../../framework/util/theme";
import { Icon } from "../../../framework/components/icon";
import { getUserSession, IUserSession } from "../../../framework/util/session";
import { Trackers } from "../../../framework/util/tracker";
import { startLoadNotificationsAction } from "../../../framework/modules/timelinev2/actions";
import { AttachmentPicker } from "../../../ui/AttachmentPicker";
import { GridAvatars } from "../../../ui/avatars/GridAvatars";
import { sendBlogPostAction, uploadBlogPostImagesAction } from "../actions";
import { notifierShowAction } from "../../../framework/util/notifier/actions";
import { hasNotch } from "react-native-device-info";
import {
  createBlogPostResourceRight,
  getBlogPostRight,
  publishBlogPostResourceRight,
  submitBlogPostResourceRight,
} from "../rights";
import { ImagePicked, imagePickedToLocalFile, ImagePicker } from "../../../infra/imagePicker";
import Notifier from "../../../framework/util/notifier";
import { SyncedFile } from "../../../framework/util/file";
import { ILocalAttachment } from "../../../ui/Attachment";

// TYPES ==========================================================================================

export interface IBlogCreatePostScreenDataProps {
  session: IUserSession;
}
export interface IBlogCreatePostScreenEventProps {
  handleUploadPostImages(images: ImagePicked[]): Promise<SyncedFile[]>;
  handleSendBlogPost(
    blog: IBlog,
    title: string,
    content: string,
    uploadedPostImages?: SyncedFile[]
  ): Promise<string | undefined>;
  handleInitTimeline(): Promise<void>;
  dispatch: ThunkDispatch<any, any, any>;
}
export interface IBlogCreatePostScreenNavParams {
  blog: IBlog;
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
    title: "",
    content: "",
    images: [],
  };

  attachmentPickerRef: any;

  // RENDER =======================================================================================

  render() {
    const { navigation } = this.props;
    const routeName = navigation.state.routeName;
    return (
      <>
        {this.renderHeader()}
        <PageView path={routeName}>
          <Notifier id="createPost" />
          <KeyboardAvoidingView
            enabled
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? (hasNotch() ? 100 : 76) : undefined} // 🍔 Big-(M)Hack of the death : On iOS KeyboardAvoidingView not working properly.
            style={{ flex: 1 }}>
            <ScrollView
              alwaysBounceVertical={false}
              contentContainerStyle={{ flexGrow: 1, paddingVertical: 12, paddingHorizontal: 16 }}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>{this.renderContent()}</TouchableWithoutFeedback>
            </ScrollView>
          </KeyboardAvoidingView>
        </PageView>
      </>
    );
  }

  renderHeader() {
    const { navigation, session } = this.props;
    const { title, content, sendLoadingState } = this.state;
    const blog = navigation.getParam("blog");
    const blogPostRight = blog && session && getBlogPostRight(blog, session);
    const blogPostDisplayRight = blogPostRight && blogPostRight.displayRight;
    const actionText =
      blogPostDisplayRight &&
      {
        [createBlogPostResourceRight]: I18n.t("blog.blogCreatePostScreen.createAction"),
        [submitBlogPostResourceRight]: I18n.t("blog.blogCreatePostScreen.submitAction"),
        [publishBlogPostResourceRight]: I18n.t("blog.blogCreatePostScreen.publishAction"),
      }[blogPostDisplayRight];
    return (
      <FakeHeader>
        <HeaderRow>
          <HeaderLeft>
            <HeaderAction
              iconName={Platform.OS === "ios" ? "chevron-left1" : "back"}
              iconSize={24}
              onPress={() => navigation.navigate("blog/select")}
            />
          </HeaderLeft>
          <HeaderCenter>
            <HeaderTitle>{I18n.t("blog.blogCreatePostScreen.title")}</HeaderTitle>
          </HeaderCenter>
          <HeaderRight>
            {sendLoadingState ? (
              <LoadingIndicator
                small
                customColor={theme.color.tertiary.light}
                customStyle={{ justifyContent: "center", paddingHorizontal: 18 }}
              />
            ) : (
              <HeaderAction
                text={actionText}
                disabled={title.length === 0 || content.length === 0}
                onPress={() => this.doSend()}
              />
            )}
          </HeaderRight>
        </HeaderRow>
      </FakeHeader>
    );
  }

  renderError() {
    return <TextSemiBold>{"Error"}</TextSemiBold>; // ToDo: great error screen here
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
    const blog = navigation.getParam("blog");
    return (
      <View style={{ marginBottom: 20, flexDirection: "row", alignItems: "center" }}>
        <GridAvatars users={[id]} />
        <View style={{ flex: 1, justifyContent: "center", marginLeft: 6 }}>
          <TextBold>{displayName}</TextBold>
          <TextLight>{blog?.title}</TextLight>
        </View>
      </View>
    );
  }

  renderPostInfos() {
    const { title, content } = this.state;
    return (
      <>
        <TextBold style={{ marginBottom: 10 }}>{I18n.t("blog.blogCreatePostScreen.postTitle")}</TextBold>
        <TextInput
          placeholder={I18n.t("blog.blogCreatePostScreen.postTitlePlaceholder")}
          value={title}
          onChangeText={text => this.setState({ title: text })}
          style={{
            marginBottom: 20,
            padding: 10,
            backgroundColor: theme.color.background.card,
            borderColor: theme.color.inputBorder,
            borderWidth: 1,
            borderRadius: 5,
            color: theme.color.text.regular,
          }}
        />
        <TextBold style={{ marginBottom: 10 }}>{I18n.t("blog.blogCreatePostScreen.postContent")}</TextBold>
        <TextInput
          placeholder={I18n.t("blog.blogCreatePostScreen.postContentPlaceholder")}
          value={content}
          onChangeText={text => this.setState({ content: text })}
          style={{
            marginBottom: 20,
            padding: 10,
            backgroundColor: theme.color.background.card,
            borderColor: theme.color.inputBorder,
            borderWidth: 1,
            borderRadius: 5,
            height: 140,
            color: theme.color.text.regular,
          }}
          textAlignVertical="top"
          multiline
        />
      </>
    );
  }

  renderPostMedia() {
    const { images } = this.state;
    const imagesAdded = images.length > 0;
    return (
      <View
        style={{
          padding: 10,
          backgroundColor: theme.color.background.card,
          borderColor: theme.color.inputBorder,
          borderWidth: 1,
          borderRadius: 5,
        }}>
        <ImagePicker
          callback={image => {
            console.log("image", image);
            this.setState({ images: [...images, image] });
          }}>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              flexDirection: imagesAdded ? "row" : "column",
              marginVertical: 10,
            }}
            // onPress={() => this.attachmentPickerRef.onPickAttachment()}
          >
            <TextAction style={{ marginRight: imagesAdded ? 5 : 0 }}>
              {I18n.t("createPost-create-mediaField")}
            </TextAction>
            <Icon name="camera-on" size={imagesAdded ? 15 : 22} color={theme.color.secondary.regular} />
          </View>
        </ImagePicker>
        <AttachmentPicker
          ref={r => (this.attachmentPickerRef = r)}
          onlyImages
          attachments={images.map(img => ({
            mime: img.type,
            name: img.fileName,
            uri: img.uri
          } as ILocalAttachment))}
          onAttachmentSelected={() => {}}
          onAttachmentRemoved={imagesToSend => this.setState({ images: imagesToSend })}
          notifierId="createBlogPost"
        />
      </View>
    );
  }

  // LIFECYCLE ====================================================================================

  // METHODS ======================================================================================

  async doSend() {
    try {
      this.setState({ sendLoadingState: true });
      await this.doSendPost();
    } finally {
      this.setState({ sendLoadingState: false });
    }
  }

  async doSendPost() {
    try {
      const {
        navigation,
        session,
        handleUploadPostImages,
        handleSendBlogPost,
        handleInitTimeline,
        dispatch,
      } = this.props;
      const { title, content, images } = this.state;
      const blog = navigation.getParam("blog");
      const blogId = blog && blog.id;
      if (!blog || !blogId) {
        throw new Error("[doSendPost] failed to retrieve blog information");
      }
      const blogPostRight = blog && session && getBlogPostRight(blog, session);
      if (!blogPostRight) {
        throw new Error("[doSendPost] user has no post rights for this blog");
      }

      // Upload post images (if added)
      let uploadedPostImages: undefined | SyncedFile[];
      if (images.length > 0) {
        uploadedPostImages = await handleUploadPostImages(images);
      }

      // Translate entered content to httml
      const htmlContent = content.replace(/\n/g, "<br>");

      // Create and submit/publish post
      await handleSendBlogPost(blog, title, htmlContent, uploadedPostImages);

      // Track action, load/navigate to timeline and display notifier
      const blogPostDisplayRight = blogPostRight.displayRight;
      const trackerEvent = {
        [createBlogPostResourceRight]: "CREATE",
        [submitBlogPostResourceRight]: "SUBMIT",
        [publishBlogPostResourceRight]: "PUBLISH",
      }[blogPostDisplayRight];
      const trackerEventText = trackerEvent === "CREATE" ? "CREATE" : `CREATE ${trackerEvent}`;
      const notifierSuccessText = {
        [createBlogPostResourceRight]: I18n.t("blog.blogCreatePostScreen.createSuccess"),
        [submitBlogPostResourceRight]: I18n.t("blog.blogCreatePostScreen.submitSuccess"),
        [publishBlogPostResourceRight]: I18n.t("blog.blogCreatePostScreen.publishSuccess"),
      }[blogPostDisplayRight];

      Trackers.trackEvent("Timeline", trackerEventText, "BlogPost");
      await handleInitTimeline();
      navigation.navigate("timeline");
      dispatch(
        notifierShowAction({
          id: "timeline",
          text: notifierSuccessText,
          icon: "checked",
          type: "success",
          duration: 8000,
        })
      );
    } catch (e) {
      // ToDo: Error handling
      const { dispatch } = this.props;
      dispatch(
        notifierShowAction({
          id: "blog/create",
          text: `${I18n.t("common.error.title")} ${I18n.t("common.error.text")}`,
          icon: "close",
          type: "error",
        })
      );
      console.warn(`[${moduleConfig.name}] doSendPost failed`, e);
    }
  }
}

// UTILS ==========================================================================================

// Add some util functions here

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => IBlogCreatePostScreenDataProps = s => {
  return {
    session: getUserSession(s),
  };
};

const mapDispatchToProps: (
  dispatch: ThunkDispatch<any, any, any>
) => IBlogCreatePostScreenEventProps = (dispatch) => ({
  handleUploadPostImages: async (images: ImagePicked[]) => {
    const localFiles = images.map(img => imagePickedToLocalFile(img));
    return dispatch(uploadBlogPostImagesAction(localFiles)) as unknown as Promise<SyncedFile[]>;
  },
  handleSendBlogPost: async (blog: IBlog, title: string, content: string, uploadedPostImages?: SyncedFile[]) => {
    return ((await dispatch(sendBlogPostAction(blog, title, content, uploadedPostImages))) as unknown) as
      | string
      | undefined;
  },
  handleInitTimeline: async () => {
    await dispatch(startLoadNotificationsAction());
  },
  dispatch,
});

const BlogCreatePostScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(BlogCreatePostScreen);
export default BlogCreatePostScreen_Connected;
