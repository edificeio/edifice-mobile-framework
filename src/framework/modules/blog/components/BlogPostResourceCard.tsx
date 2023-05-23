import { Moment } from 'moment';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { ContentCardHeader, ContentCardIcon, ContentCardTitle, TouchableResourceCard } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/icon';
import { CaptionBoldText, SmallBoldText, SmallText } from '~/framework/components/text';
import { extractMediaFromHtml, extractTextFromHtml, renderMediaPreview } from '~/framework/util/htmlParser/content';
import { isStringEmpty } from '~/framework/util/string';
import { ArticleContainer } from '~/ui/ContainerContent';

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', alignItems: 'center' },
});

export interface BlogPostResourceCardProps {
  action: () => void;
  authorId: string;
  authorName: string;
  comments: number;
  contentHtml: string;
  date: Moment;
  title: string;
  state: 'PUBLISHED' | 'SUBMITTED';
}

export const commentsString = (comments: number) =>
  comments
    ? comments === 1
      ? `1 ${I18n.get('common.comment.comment').toLowerCase()}`
      : `${comments} ${I18n.get('common.comment.comments').toLowerCase()}`
    : I18n.get('common.comment.noComments');

export const BlogPostResourceCard = ({
  action,
  authorId,
  authorName,
  comments,
  contentHtml,
  date,
  title,
  state,
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
                <SmallBoldText numberOfLines={authorTextMaxLines}>{`${I18n.get('common.by')} ${authorName}`}</SmallBoldText>
              ) : undefined
            }
            date={date}
          />
        }
        title={
          <>
            {state === 'SUBMITTED' ? (
              <SmallBoldText style={{ color: theme.palette.status.warning.regular }}>
                {I18n.get('blog.post.needValidation')}
              </SmallBoldText>
            ) : null}
            <ContentCardTitle>{title}</ContentCardTitle>
          </>
        }
        footer={
          state !== 'SUBMITTED' ? (
            <View style={styles.footer}>
              <Icon style={{ marginRight: UI_SIZES.spacing.minor }} size={18} name="chat3" color={theme.ui.text.regular} />
              <CaptionBoldText style={{ color: theme.ui.text.light }}>{commentsString(comments)}</CaptionBoldText>
            </View>
          ) : undefined
        }>
        {hasBlogPostText ? (
          <SmallText
            style={{ marginBottom: blogPostMedia?.length ? UI_SIZES.spacing.small : undefined }}
            numberOfLines={contentTextMaxLines}>
            {blogPostText}
          </SmallText>
        ) : null}
        {hasBlogPostMedia ? renderMediaPreview(blogPostMedia) : null}
      </TouchableResourceCard>
    </ArticleContainer>
  );
};
