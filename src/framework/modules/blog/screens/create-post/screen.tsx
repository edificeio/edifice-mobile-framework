import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import MultilineTextInput from '~/framework/components/inputs/multiline';
import { RichEditorForm } from '~/framework/components/inputs/rich-text';
import { LoadingIndicator } from '~/framework/components/loading';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import Toast from '~/framework/components/toast';
import { getSession } from '~/framework/modules/auth/reducer';
import { sendBlogPostAction } from '~/framework/modules/blog/actions';
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
import { Trackers } from '~/framework/util/tracker';

import styles from './styles';
import { BlogCreatePostScreenDataProps, BlogCreatePostScreenEventProps, BlogCreatePostScreenProps } from './types';

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

const BlogCreatePostScreen = (props: BlogCreatePostScreenProps) => {
  const [loadingState, setLoadingState] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');

  const { route, navigation, session, handleSendBlogPost, handleInitTimeline } = props;
  const blog = route.params.blog;

  const doSendPost = async () => {
    try {
      const blogId = blog && blog.id;
      if (!blog || !blogId) {
        throw new Error('[doSendPost] failed to retrieve blog information');
      }
      const blogPostRight = blog && session && getBlogPostRight(blog, session);
      if (!blogPostRight) {
        throw new Error('[doSendPost] user has no post rights for this blog');
      }

      // Translate entered content to httml
      const htmlContent = content.replace(/\n/g, '<br>').trim();

      // Create and submit/publish post
      await handleSendBlogPost(blog, title.trim(), htmlContent);

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
  };

  const doSend = async () => {
    Keyboard.dismiss();
    try {
      setLoadingState(true);
      await doSendPost();
    } finally {
      setLoadingState(false);
    }
  };

  React.useEffect(() => {
    props.navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <NavBarActionsGroup
          elements={[
            {
              ...(loadingState ? (
                <LoadingIndicator small customColor={theme.ui.text.inverse} />
              ) : (
                <NavBarAction icon="ui-send" disabled={title.length === 0 || content.length === 0} onPress={doSend} />
              )),
            },
          ]}
        />
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, loadingState, content]);

  const renderPostInfos = () => {
    return (
      <RichEditorForm
        topForm={
          <MultilineTextInput
            style={styles.inputTitle}
            placeholder={I18n.get('blog-createpost-post-title-placeholder')}
            numberOfLines={1}
            onChangeText={text => setTitle(text)}
            value={title}
          />
        }
        initialContentHtml=""
        uploadParams={
          blog.visibility === 'PUBLIC'
            ? {
                public: true,
              }
            : {
                parent: 'protected',
              }
        }
        onChangeText={value => setContent(value)}
      />
    );
  };

  return <>{renderPostInfos()}</>;
};

const mapStateToProps: (s: IGlobalState) => BlogCreatePostScreenDataProps = s => {
  return {
    session: getSession(),
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>) => BlogCreatePostScreenEventProps = dispatch => ({
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
