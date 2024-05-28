import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import Audience from '~/framework/components/audience';
import { ContentCardHeader, ContentCardIcon } from '~/framework/components/card';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text';
import { HeadingSText, SmallBoldText } from '~/framework/components/text';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { blogRouteNames } from '~/framework/modules/blog/navigation';
import type { Blog, BlogPostWithAudience } from '~/framework/modules/blog/reducer';
import { DisplayedBlog } from '~/framework/modules/blog/screens/BlogExplorerScreen';

import styles from './style';

interface BlogPostDetailsProps {
  blog: DisplayedBlog | Blog;
  post: BlogPostWithAudience;
  session: AuthActiveAccount;
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

  const navigation = useNavigation();

  const richContent = React.useMemo(() => {
    return <RichEditorViewer content={post.content} onLoad={onReady} />;
  }, [post.content, onReady]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.contentHeader}>
          <ContentCardHeader
            icon={<ContentCardIcon userIds={[post.author.userId || require('ASSETS/images/system-avatar.png')]} />}
            text={
              blog.author.username ? (
                <SmallBoldText numberOfLines={1}>{`${I18n.get('common-by')} ${post.author.username}`}</SmallBoldText>
              ) : undefined
            }
            date={blog.modified}
          />
        </View>
        {post.state === 'SUBMITTED' ? (
          <SmallBoldText style={styles.postNeedValidation}>{I18n.get('blog-postdetails-needvalidation')}</SmallBoldText>
        ) : null}
        <SmallBoldText style={styles.blogTitle}>{blog.title}</SmallBoldText>
        <HeadingSText>{post.title}</HeadingSText>
        {richContent}
      </View>
      {post.state === 'PUBLISHED' ? (
        <Audience
          containerStyle={styles.footer}
          actionViews={() => navigation.navigate(blogRouteNames.blogAudience, { blogPostId: post._id })}
          actionReactions={() => navigation.navigate(blogRouteNames.blogReactions, { blogPostId: post._id })}
          nbComments={post.comments?.length}
          nbViews={post.audience?.views}
          infosReactions={post.audience?.reactions}
          referer={{ module: 'blog', resourceType: 'post', resourceId: post._id }}
          session={props.session}
        />
      ) : null}
    </View>
  );
}
