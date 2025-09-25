import * as React from 'react';
import { View } from 'react-native';

import styles from './styles';
import type { BlogPostDetailsProps, PostDetailsProps, PostWithAudienceProps } from './types';

import { I18n } from '~/app/i18n';
import { ContentCardHeader, ContentCardIcon } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text';
import { HeadingSText, SmallBoldText } from '~/framework/components/text';
import Audience from '~/framework/modules/audience/components';
import { type BlogPostWithAudience, countComments } from '~/framework/modules/blog/reducer';
import { hasPermissionManager } from '~/framework/modules/blog/rights';

const PostDetails = React.memo(<T extends PostDetailsProps>(props: T) => {
  const { onReady, post, session, ...additionalProps } = props;

  const isBlogPostCheck = (p: BlogPostWithAudience | PostWithAudienceProps): p is BlogPostWithAudience => {
    return 'state' in p;
  };

  const isBlogPost = isBlogPostCheck(post);

  const blogProps = additionalProps as Partial<BlogPostDetailsProps>;
  const { blog } = blogProps;

  const richContent = React.useMemo(() => {
    return <RichEditorViewer content={post.content} onLoad={onReady} />;
  }, [post.content, onReady]);

  const totalComments = React.useMemo(() => {
    return isBlogPost ? countComments(post) : 0;
  }, [isBlogPost, post]);

  const containerStyle = React.useMemo(() => {
    return !isBlogPost
      ? [styles.container, { paddingHorizontal: UI_SIZES.spacing.big }, props.borderBottomStyle]
      : [styles.container];
  }, [isBlogPost, props.borderBottomStyle]);

  return (
    <View style={containerStyle}>
      <View style={styles.content}>
        <View style={styles.contentHeader}>
          <ContentCardHeader
            icon={<ContentCardIcon userIds={[post.author.userId || require('ASSETS/images/system-avatar.png')]} />}
            text={
              post?.author.username ? (
                <SmallBoldText numberOfLines={1}>{`${I18n.get('common-by')} ${post.author.username}`}</SmallBoldText>
              ) : undefined
            }
            date={post.modified}
          />
        </View>
        {isBlogPost && post.state === 'SUBMITTED' ? (
          <SmallBoldText style={styles.postNeedValidation}>{I18n.get('blog-postdetails-needvalidation')}</SmallBoldText>
        ) : null}
        {isBlogPost && (
          <>
            <SmallBoldText style={styles.blogTitle}>{blog?.title}</SmallBoldText>
            <HeadingSText>{post.title}</HeadingSText>
          </>
        )}
        {richContent}
      </View>
      {!isBlogPost || (post.state === 'PUBLISHED' && blog?.visibility !== 'PUBLIC') ? (
        <Audience
          containerStyle={styles.footer}
          nbComments={totalComments}
          nbViews={isBlogPost ? post.audience?.views : undefined}
          infosReactions={post.audience?.reactions}
          referer={{ module: isBlogPost ? 'blog' : 'announcement', resourceId: post._id, resourceType: 'post' }}
          session={props.session}
          isManager={session && blog && hasPermissionManager(blog, session)}
          showComments={isBlogPost}
        />
      ) : null}
    </View>
  );
});

export default PostDetails;
