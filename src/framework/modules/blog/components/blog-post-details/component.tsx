import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { ContentCardHeader, ContentCardIcon, ResourceView } from '~/framework/components/card';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text';
import { Icon } from '~/framework/components/picture';
import { CaptionBoldText, HeadingSText, SmallBoldText } from '~/framework/components/text';
import type { Blog, BlogPost } from '~/framework/modules/blog/reducer';
import { DisplayedBlog } from '~/framework/modules/blog/screens/BlogExplorerScreen';

import styles from './style';

interface BlogPostDetailsProps {
  blog: DisplayedBlog | Blog;
  post: BlogPost;
  onReady?: () => void;
}

export const commentsString = (comments: number) =>
  comments
    ? comments === 1
      ? `1 ${I18n.get('blog-postlist-comment').toLowerCase()}`
      : `${comments} ${I18n.get('blog-postlist-comments').toLowerCase()}`
    : I18n.get('blog-postlist-comment-nocomments');

export function BlogPostDetails(props: BlogPostDetailsProps) {
  const { blog, post, onReady } = props;

  React.useEffect(() => {
    console.debug('BlogPostDetails mounted');
  }, []);

  const richContent = React.useMemo(() => {
    console.debug('render richEditorViewer');
    return <RichEditorViewer content={post.content} onLoad={onReady} />;
  }, [post.content, onReady]);

  return (
    <View style={styles.container}>
      <ResourceView
        header={
          <ContentCardHeader
            icon={<ContentCardIcon userIds={[post.author.userId || require('ASSETS/images/system-avatar.png')]} />}
            text={
              blog.author.username ? (
                <SmallBoldText numberOfLines={1}>{`${I18n.get('common-by')} ${post.author.username}`}</SmallBoldText>
              ) : undefined
            }
            date={blog.modified}
          />
        }>
        {post.state === 'SUBMITTED' ? (
          <SmallBoldText style={styles.postNeedValidation}>{I18n.get('blog-postdetails-needvalidation')}</SmallBoldText>
        ) : null}
        <SmallBoldText style={styles.blogTitle}>{blog.title}</SmallBoldText>
        <HeadingSText>{post.title}</HeadingSText>
        {richContent}
      </ResourceView>
      {post.state === 'PUBLISHED' ? (
        <View style={styles.postCommentsTotal}>
          <Icon style={styles.postCommentsIcon} size={18} name="chat3" color={theme.ui.text.regular} />
          <CaptionBoldText style={styles.postCommentsTotalText}>{commentsString(post.comments?.length || 0)}</CaptionBoldText>
        </View>
      ) : null}
    </View>
  );
}
