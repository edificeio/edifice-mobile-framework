/**
 * Change of a post: its title and its content. It is then published again, or submitted (see `editBlogPost`).
 */
import * as React from 'react';
import { ActivityIndicator, Keyboard } from 'react-native';

import type { StaticScreenProps } from '@react-navigation/native';

import { defineModal, headerAction, headerCustom, headerRightActions, useNavigation } from '~/app/navigation-new';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import MultilineTextInput from '~/framework/components/inputs/multiline';
import { RichEditorForm } from '~/framework/components/inputs/rich-text';
import Toast from '~/framework/components/toast';
import { editBlogPost } from '~/framework/modules/blog/actions';
import { getBlogPostRight } from '~/framework/modules/blog/model/business';
import { withSession } from '~/modules/auth/hoc';
import { I18n } from '~/util/i18n';

import styles from './styles';
import { BlogEditPostScreenNavParams } from './types';

/** While the post is saved, instead of the button to save it (the theme is read when called, not at import). */
const savingIndicator = () =>
  headerCustom(<ActivityIndicator size={UI_SIZES.elements.navbarIconSize} color={theme.palette.grey.black} />);

const preventBackI18n = {
  text: 'blog-createpost-unsavedpublication',
  title: 'blog-createpost-confirmation-unsavedpublication',
};

const BlogEditPostScreen = withSession<StaticScreenProps<BlogEditPostScreenNavParams>>(function ({ route, session }) {
  const { blog, postId, postState } = route.params;
  const [loadingState, setLoadingState] = React.useState(false);
  const [title, setTitle] = React.useState(route.params.title);
  const [content, setContent] = React.useState(route.params.content);
  const [saving, setSaving] = React.useState(false);

  const navigation = useNavigation();

  /** @returns whether the post was saved. */
  const doEditPost = React.useCallback(async () => {
    try {
      const blogId = blog && blog.id;
      if (!blog || !blogId) {
        throw new Error('[doEditPost] failed to retrieve blog information');
      }
      const blogPostRight = getBlogPostRight(blog, session);
      if (!blogPostRight) {
        throw new Error('[doEditPost] user has no post rights for this blog');
      }
      // Translate entered content to httml
      const htmlContent = content.replace(/\n/g, '<br>').trim();
      await editBlogPost(session, blog, postId, title.trim(), htmlContent, postState);
      navigation.goBack();
      Toast.showSuccess(I18n.get('blog-editpost-edit-success'));
      return true;
    } catch {
      Toast.showError(I18n.get('blog-editpost-edit-errortext'));
      return false;
    }
  }, [blog, content, navigation, postId, postState, session, title]);

  const doEdit = React.useCallback(async () => {
    Keyboard.dismiss();
    setSaving(true);
    setLoadingState(true);
    // Once saved, the screen is closed: only a failure gives the button back
    if (!(await doEditPost())) {
      setSaving(false);
      setLoadingState(false);
    }
  }, [doEditPost]);

  // The button depends on the title, the content and the saving, states of the screen
  React.useLayoutEffect(() => {
    navigation.setOptions(
      headerRightActions(
        loadingState
          ? savingIndicator()
          : headerAction({
              disabled: title.trim().length === 0 || content.trim().length === 0,
              icon: 'ui-save',
              label: I18n.get('common-save'),
              onPress: doEdit,
              testID: 'blog-editpost-save',
            }),
      ),
    );
  }, [content, doEdit, loadingState, navigation, title]);

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
      initialContentHtml={route.params.content}
      uploadParams={uploadParams}
      onChangeText={setContent}
      preventBackI18n={preventBackI18n}
      saving={saving}
      pageStyle={styles.page}
      placeholder={I18n.get('blog-createpost-postcontent-placeholder')}
    />
  );
});
BlogEditPostScreen.displayName = 'BlogEditPostScreen';

export default defineModal({
  options: () => ({ presentation: 'fullScreenModal', title: I18n.get('blog-editpost-title') }),
  screen: BlogEditPostScreen,
});
