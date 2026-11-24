/**
 * Creation of a post in a blog: it is then submitted or published, as the right of the user on the blog says.
 */
import * as React from 'react';
import { ActivityIndicator, Keyboard } from 'react-native';

import type { StaticScreenProps } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

import { defineModal, headerAction, headerCustom, headerRightActions, useNavigation } from '~/app/navigation-new';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import MultilineTextInput from '~/framework/components/inputs/multiline';
import { RichEditorForm } from '~/framework/components/inputs/rich-text';
import Toast from '~/framework/components/toast';
import { sendBlogPost } from '~/framework/modules/blog/actions';
import {
  BlogPostResourceRight,
  createBlogPostResourceRight,
  getBlogPostRight,
  publishBlogPostResourceRight,
  submitBlogPostResourceRight,
} from '~/framework/modules/blog/model/business';
// ToDo(blog-migration): code and routes of `timeline`, not loaded: only reached without `referrer` (choice of the blog, opened by the
// workflow of `timeline`). To take back with the switch of `timeline`
import { startLoadNotificationsAction } from '~/framework/modules/timeline/actions';
import { timelineRouteNames } from '~/framework/modules/timeline/navigation';
import { withSession } from '~/modules/auth/hoc';
import { I18n } from '~/util/i18n';

import styles from './styles';
import { BlogCreatePostScreenNavParams } from './types';

/** While the post is sent, instead of the button to send it (the theme is read when called, not at import). */
const sendingIndicator = () =>
  headerCustom(<ActivityIndicator size={UI_SIZES.elements.navbarIconSize} color={theme.palette.grey.black} />);

const preventBackI18n = {
  text: 'blog-createpost-unsavedpublication',
  title: 'blog-createpost-confirmation-unsavedpublication',
};

/** What the toast says once the post is sent, by what the user was told he does (`displayRight`). */
const successText = (displayRight: BlogPostResourceRight) =>
  I18n.get(
    {
      [createBlogPostResourceRight]: 'blog-createpost-create-success',
      [publishBlogPostResourceRight]: 'blog-createpost-publish-success',
      [submitBlogPostResourceRight]: 'blog-createpost-submit-success',
    }[displayRight],
  );

const BlogCreatePostScreen = withSession<StaticScreenProps<BlogCreatePostScreenNavParams>>(function ({ route, session }) {
  const [loadingState, setLoadingState] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const navigation = useNavigation();
  // ToDo(blog-migration): the dispatch of `startLoadNotificationsAction`, a thunk of `timeline` (see its import)
  const dispatch = useDispatch<ThunkDispatch<unknown, unknown, UnknownAction>>();
  const { blog, referrer } = route.params;

  const doSendPost = React.useCallback(async () => {
    try {
      const blogId = blog && blog.id;
      if (!blog || !blogId) {
        throw new Error('[doSendPost] failed to retrieve blog information');
      }
      const blogPostRight = getBlogPostRight(blog, session);
      if (!blogPostRight) {
        throw new Error('[doSendPost] user has no post rights for this blog');
      }

      // Translate entered content to httml
      const htmlContent = content.replace(/\n/g, '<br>').trim();

      // Create and submit/publish post
      await sendBlogPost(session, blog, title.trim(), htmlContent);

      // Load the timeline, go back to where the creation was opened from, and display toast
      await dispatch(startLoadNotificationsAction());
      if (referrer) navigation.navigate(referrer, { blogId, forceReload: true }, { pop: true });
      else {
        // @ts-expect-error the home of `timeline` is not a route of the new navigation (see the import)
        navigation.navigate(timelineRouteNames.Home, { forceReload: true }, { pop: true });
      }
      Toast.showSuccess(successText(blogPostRight.displayRight));
    } catch (e: any) {
      if (e.response?.body === '{"error":"file.too.large"}') {
        Toast.showError(I18n.get('blog-createpost-fullstorage'));
      } else if ((e as Error).message && (e as Error).message !== 'handled') {
        Toast.showError(I18n.get('blog-createpost-publish-error-text'));
      }
    }
  }, [blog, content, dispatch, navigation, referrer, session, title]);

  const doSend = React.useCallback(async () => {
    Keyboard.dismiss();
    try {
      setSaving(true);
      setLoadingState(true);
      await doSendPost();
    } finally {
      setLoadingState(false);
      setSaving(false);
    }
  }, [doSendPost]);

  // The button depends on the title, the content and the sending, states of the screen
  React.useLayoutEffect(() => {
    navigation.setOptions(
      headerRightActions(
        loadingState
          ? sendingIndicator()
          : headerAction({
              disabled: title.trim().length === 0 || content.trim().length === 0,
              icon: 'ui-send',
              label: I18n.get('common-send'),
              onPress: doSend,
              testID: 'button-header-send',
            }),
      ),
    );
  }, [content, doSend, loadingState, navigation, title]);

  const topForm = React.useCallback(
    (onChange: () => void) => (
      <MultilineTextInput
        style={styles.inputTitle}
        placeholder={I18n.get('blog-createpost-post-title-placeholder')}
        numberOfLines={1}
        onChangeText={text => {
          setTitle(text);
          onChange();
        }}
        value={title}
        testID="input-subject-title"
      />
    ),
    [title],
  );

  const uploadParams = React.useMemo(
    () => (blog.visibility === 'PUBLIC' ? { public: true } : { parent: 'protected' as const }),
    [blog.visibility],
  );

  return (
    <RichEditorForm
      topForm={topForm}
      initialContentHtml=""
      uploadParams={uploadParams}
      onChangeText={setContent}
      preventBackI18n={preventBackI18n}
      saving={saving}
      pageStyle={styles.page}
      placeholder={I18n.get('blog-createpost-postcontent-placeholder')}
      testID="input-subject-content"
    />
  );
});
BlogCreatePostScreen.displayName = 'BlogCreatePostScreen';

export default defineModal({
  options: () => ({ presentation: 'fullScreenModal', title: I18n.get('blog-createpost-title') }),
  screen: BlogCreatePostScreen,
});
