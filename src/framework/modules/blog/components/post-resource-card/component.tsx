import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { ContentCardHeader, ContentCardIcon, ContentCardTitle, TouchableResourceCard } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import Pill from '~/framework/components/pill';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import Audience from '~/framework/modules/audience/components';
import { extractMediaFromHtml, extractTextFromHtml, renderMediaPreview } from '~/framework/util/htmlParser/content';
import { isStringEmpty } from '~/framework/util/string';
import { ArticleContainer } from '~/ui/ContainerContent';

import styles from './styles';
import { BlogPostResourceCardProps } from './types';

export const BlogPostResourceCard = React.memo(
  ({
    action,
    audience,
    authorId,
    authorName,
    blogVisibility,
    comments,
    contentHtml,
    date,
    isManager,
    pinned,
    resourceId,
    session,
    state,
    title,
  }: BlogPostResourceCardProps) => {
    const authorTextMaxLines = 1;
    const contentTextMaxLines = 5;
    const blogPostText = extractTextFromHtml(contentHtml);
    const blogPostMedia = extractMediaFromHtml(contentHtml);
    const hasBlogPostText = blogPostText && !isStringEmpty(blogPostText);
    const hasBlogPostMedia = blogPostMedia?.length;

    return (
      <ArticleContainer>
        <TouchableResourceCard
          onPress={action}
          style={pinned ? styles.cardPinned : undefined}
          header={
            <ContentCardHeader
              icon={<ContentCardIcon userIds={[authorId || require('ASSETS/images/system-avatar.png')]} />}
              text={
                authorName ? (
                  <SmallBoldText numberOfLines={authorTextMaxLines}>{`${I18n.get('common-by')} ${authorName}`}</SmallBoldText>
                ) : undefined
              }
              date={date}
            />
          }
          title={
            <>
              {state === 'SUBMITTED' ? (
                <SmallBoldText style={{ color: theme.palette.status.warning.regular }}>
                  {I18n.get('blog-postlist-needvalidation')}
                </SmallBoldText>
              ) : null}
              <ContentCardTitle>{title}</ContentCardTitle>
              {pinned ? (
                <View style={styles.pinnedPill}>
                  <Pill
                    color={theme.palette.complementary.purple.pale}
                    icon="ui-pin"
                    size="normal"
                    text={I18n.get('blog-postlist-pinned')}
                    textColor={theme.palette.complementary.purple.regular}
                  />
                </View>
              ) : null}
            </>
          }
          footer={
            state !== 'SUBMITTED' && blogVisibility !== 'PUBLIC' ? (
              <Audience
                nbComments={comments}
                nbViews={audience?.views}
                infosReactions={audience?.reactions}
                referer={{ module: 'blog', resourceId, resourceType: 'post' }}
                session={session}
                preview
                isManager={isManager}
              />
            ) : undefined
          }>
          {hasBlogPostText ? (
            <SmallText
              style={{ marginBottom: blogPostMedia?.length ? UI_SIZES.spacing.small : undefined }}
              numberOfLines={contentTextMaxLines}>
              {blogPostText}
            </SmallText>
          ) : null}
          {hasBlogPostMedia ? (
            <View pointerEvents="none">
              {renderMediaPreview(blogPostMedia, { module: 'blog', resourceId, resourceType: 'post' })}
            </View>
          ) : null}
        </TouchableResourceCard>
      </ArticleContainer>
    );
  },
);
