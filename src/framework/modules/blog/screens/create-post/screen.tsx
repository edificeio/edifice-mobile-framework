import { useHeaderHeight } from '@react-navigation/elements';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { Animated, Keyboard, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { RichEditor, RichToolbar } from '~/framework/components/inputs/rich-text-editor';
import { LoadingIndicator } from '~/framework/components/loading';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import Toast from '~/framework/components/toast';
import { getSession } from '~/framework/modules/auth/reducer';
import { editBlogPostAction, sendBlogPostAction } from '~/framework/modules/blog/actions';
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
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';
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
    title: '',
    titleStyle: { width: undefined },
  }),
});

const BlogCreatePostScreen = (props: BlogCreatePostScreenProps) => {
  const [loadingState, setLoadingState] = React.useState(false);
  const [title, setTitle] = React.useState(props.route.params.title ?? '');
  const [contentHtml, setContentHtml] = React.useState(props.route.params.content ?? '');
  const contentRef = React.useRef('');
  const headerHeight = useHeaderHeight();
  const richText = React.useRef<RichEditor>(null);
  const scrollRef = React.useRef<ScrollView>(null);
  const opacityToolbar = React.useRef(new Animated.Value(0)).current;
  const transformToolbar = React.useRef(new Animated.Value(90)).current;

  const getContent = () => contentRef.current;

  const handleBlur = React.useCallback(() => {
    Animated.timing(opacityToolbar, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    Animated.timing(transformToolbar, {
      toValue: 90,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [opacityToolbar, transformToolbar]);

  const handleChange = React.useCallback((html: string) => {
    contentRef.current = html;
    setContentHtml(html);
  }, []);

  const handleCursorPosition = React.useCallback((scrollY: number) => {
    // Positioning scroll bar
    scrollRef.current!.scrollTo({ y: scrollY - 30, animated: true });
  }, []);

  const handleFocus = React.useCallback(() => {
    console.log('editor focus');
    Animated.timing(opacityToolbar, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    Animated.timing(transformToolbar, {
      toValue: 45,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [opacityToolbar, transformToolbar]);

  const renderToolbar = () => {
    return (
      <Animated.View style={{ transform: [{ translateY: transformToolbar }], opacity: opacityToolbar }}>
        <RichToolbar editor={richText} style={styles.richBar} />
      </Animated.View>
    );
  };

  const doEditPost = async () => {
    try {
      console.log('edit post');
      const { route, navigation, session, handleEditBlogPost, handleInitTimeline } = props;

      const content = getContent();

      const blog = route.params.blog;
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

      await handleEditBlogPost(blog, props.route.params.postId, title.trim(), htmlContent);

      navigation.goBack();
      Toast.showSuccess(I18n.get('blog-createpost-publish-success'));
    } catch (e: any) {
      Toast.showError(I18n.get('blog-createpost-publish-error-text'));
    }
  };

  const doSendPost = async () => {
    try {
      const { route, navigation, session, handleSendBlogPost, handleInitTimeline } = props;

      const content = getContent();

      const blog = route.params.blog;
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
      if (props.route.params.postId) await doEditPost();
      else {
        await doSendPost();
      }
    } finally {
      setLoadingState(false);
    }
  };

  React.useEffect(() => {
    props.navigation.setOptions({
      headerTitle: navBarTitle(props.route.params.postId ? 'Modifier le billet' : I18n.get('blog-createpost-title')),
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <NavBarActionsGroup
          elements={[
            {
              ...(loadingState ? (
                <LoadingIndicator small customColor={theme.ui.text.inverse} />
              ) : (
                <NavBarAction
                  icon={props.route.params.postId ? 'ui-save' : 'ui-send'}
                  disabled={title.length === 0 || contentHtml.length === 0}
                  onPress={doSend}
                />
              )),
            },
          ]}
        />
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, loadingState, contentHtml]);

  const renderPostInfos = () => {
    return (
      <PageView>
        <KeyboardAvoidingView
          keyboardVerticalOffset={headerHeight}
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView keyboardDismissMode="none" nestedScrollEnabled ref={scrollRef} scrollEventThrottle={20} style={styles.scroll}>
            <TextInput
              style={styles.inputTitle}
              placeholder="Titre du billet"
              autoCorrect={false}
              spellCheck={false}
              onChangeText={text => setTitle(text)}
              value={title}
            />
            <RichEditor
              disabled={false}
              enterKeyHint="done"
              editorStyle={styles.content}
              firstFocusEnd={false}
              initialContentHTML={props.route.params.content ?? ''}
              initialFocus={false}
              pasteAsPlainText
              placeholder="Saisissez votre texte"
              ref={richText}
              style={styles.rich}
              useContainer
              onBlur={handleBlur}
              onChange={handleChange}
              onCursorPosition={handleCursorPosition}
              onFocus={handleFocus}
            />
          </ScrollView>
          {renderToolbar()}
        </KeyboardAvoidingView>
      </PageView>
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
  handleEditBlogPost: async (blog: Blog, postId: string, title: string, content: string) => {
    return (await dispatch(editBlogPostAction(blog, postId, title, content))) as unknown as string | undefined;
  },
  handleInitTimeline: async () => {
    await dispatch(startLoadNotificationsAction());
  },
  dispatch,
});

const BlogCreatePostScreenConnected = connect(mapStateToProps, mapDispatchToProps)(BlogCreatePostScreen);
export default BlogCreatePostScreenConnected;
