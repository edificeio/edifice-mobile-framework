import * as React from 'react';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import AudienceMeasurement from '~/framework/components/audience-measurement';
import { ContentCardHeader, ContentCardIcon, ContentCardTitle, TouchableResourceCard } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { extractMediaFromHtml, extractTextFromHtml, renderMediaPreview } from '~/framework/util/htmlParser/content';
import { isStringEmpty } from '~/framework/util/string';
import { ArticleContainer } from '~/ui/ContainerContent';

import { BlogPostResourceCardProps } from './types';

export const BlogPostResourceCard = React.memo(
  ({
    action,
    authorId,
    authorName,
    comments,
    contentHtml,
    date,
    title,
    state,
    resourceId,
    audience,
    session,
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
            </>
          }
          footer={
            state !== 'SUBMITTED' ? (
              <AudienceMeasurement
                nbComments={comments}
                nbViews={audience?.views}
                infosReactions={audience?.reactions}
                referer={{ module: 'blog', resourceType: 'post', resourceId }}
                session={session}
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
          {hasBlogPostMedia ? renderMediaPreview(blogPostMedia, { module: 'blog', resourceType: 'post', resourceId }) : null}
        </TouchableResourceCard>
      </ArticleContainer>
    );
  },
);
