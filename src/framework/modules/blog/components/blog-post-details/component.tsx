import * as React from 'react';
import { View } from 'react-native';

import styles from './style';

import { I18n } from '~/app/i18n';
import { ContentCardHeader, ContentCardIcon } from '~/framework/components/card';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text';
import { HeadingSText, SmallBoldText } from '~/framework/components/text';
import Audience from '~/framework/modules/audience/components';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { type Blog, type BlogPostWithAudience, countComments } from '~/framework/modules/blog/reducer';
import { hasPermissionManager } from '~/framework/modules/blog/rights';
import { DisplayedBlog } from '~/framework/modules/blog/screens/BlogExplorerScreen';

interface BlogPostDetailsProps {
  blog: DisplayedBlog | Blog;
  post: BlogPostWithAudience;
  session: AuthActiveAccount;
  onReady?: () => void;
}

export function BlogPostDetails(props: BlogPostDetailsProps) {
  const { blog, onReady, post, session } = props;

  const richContent = React.useMemo(() => {
    return <RichEditorViewer content={post.content} onLoad={onReady} />;
  }, [post.content, onReady]);

  const totalComments = React.useMemo(() => countComments(post), [post]);

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
            date={post.modified}
          />
        </View>
        {post.state === 'SUBMITTED' ? (
          <SmallBoldText style={styles.postNeedValidation}>{I18n.get('blog-postdetails-needvalidation')}</SmallBoldText>
        ) : null}
        <SmallBoldText style={styles.blogTitle}>{blog.title}</SmallBoldText>
        <HeadingSText>{post.title}</HeadingSText>
        {richContent}
      </View>
      {post.state === 'PUBLISHED' && blog.visibility !== 'PUBLIC' ? (
        <Audience
          containerStyle={styles.footer}
          nbComments={totalComments}
          nbViews={post.audience?.views}
          infosReactions={post.audience?.reactions}
          referer={{ module: 'blog', resourceId: post._id, resourceType: 'post' }}
          session={props.session}
          isManager={session && hasPermissionManager(blog, session)}
        />
      ) : null}
    </View>
  );
}
