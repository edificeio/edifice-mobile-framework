import I18n from 'i18n-js';
import { Moment } from 'moment';
import * as React from 'react';
import { View } from 'react-native';

import theme from '~/app/theme';
import { ContentCardHeader, ContentCardIcon, ContentCardTitle, TouchableResourceCard } from '~/framework/components/card';
import { Icon } from '~/framework/components/icon';
import Label from '~/framework/components/label';
import { FontStyle, Text, TextSemiBold } from '~/framework/components/text';
import { extractMediaFromHtml, extractTextFromHtml, renderMediaPreview } from '~/framework/util/htmlParser/content';
import { isStringEmpty } from '~/framework/util/string';
import { ArticleContainer } from '~/ui/ContainerContent';

export const commentsString = (comments: number) =>
  comments
    ? comments === 1
      ? `1 ${I18n.t('common.comment.comment').toLowerCase()}`
      : `${comments} ${I18n.t('common.comment.comments').toLowerCase()}`
    : I18n.t('common.comment.noComments');

export interface IBlogPostResourceCardProps {
  action: () => void;
  authorId: string;
  authorName: string;
  comments: number;
  contentHtml: string;
  date: Moment;
  title: string;
  state: 'PUBLISHED' | 'SUBMITTED';
}

export const BlogPostResourceCard = ({
  action,
  authorId,
  authorName,
  comments,
  contentHtml,
  date,
  title,
  state,
}: IBlogPostResourceCardProps) => {
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
                <TextSemiBold numberOfLines={authorTextMaxLines}>{`${I18n.t('common.by')} ${authorName}`}</TextSemiBold>
              ) : undefined
            }
            date={date}
          />
        }
        title={
          <>
            {state === 'SUBMITTED' ? (
              <Label
                text={I18n.t('blog.post.needValidation')}
                color={theme.palette.status.warning}
                labelStyle="outline"
                labelSize="small"
              />
            ) : null}
            <ContentCardTitle style={{ ...FontStyle.Bold }}>{title}</ContentCardTitle>
          </>
        }
        footer={
          state !== 'SUBMITTED' ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Icon style={{ marginRight: 5 }} size={18} name="chat3" color={theme.ui.text.regular} />
              <TextSemiBold style={{ color: theme.ui.text.light, fontSize: 12 }}>{commentsString(comments)}</TextSemiBold>
            </View>
          ) : undefined
        }>
        {hasBlogPostText ? (
          <Text
            style={{ color: theme.ui.text.regular, marginBottom: blogPostMedia?.length ? 10 : undefined }}
            numberOfLines={contentTextMaxLines}>
            {blogPostText}
          </Text>
        ) : null}
        {hasBlogPostMedia ? renderMediaPreview(blogPostMedia) : null}
      </TouchableResourceCard>
    </ArticleContainer>
  );
};
