import * as React from 'react';
import { View } from 'react-native';
import I18n from 'i18n-js';
import { Moment } from 'moment';

import theme from '~/app/theme';
import { ContentCardHeader, ContentCardIcon, ContentCardTitle, TouchableResourceCard } from '~/framework/components/card';
import { ArticleContainer } from '~/ui/ContainerContent';
import { Icon } from '~/framework/components/icon';
import { NestedText, Text, TextBold, TextSemiBold, TextSizeStyle } from '~/framework/components/text';
import { extractMediaFromHtml, extractTextFromHtml, renderMediaPreview } from '~/framework/util/htmlParser/content';
import Label from '~/framework/components/label';

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
  const [isTextTruncatedWithBackspace, setIsTextTruncatedWithBackspace] = React.useState(false);
  const authorTextMaxLines = 1;
  const contentTextMaxLines = 5;
  const commentsString = comments
    ? comments === 1
      ? `1 ${I18n.t('common.comment.comment').toLowerCase()}`
      : `${comments} ${I18n.t('common.comment.comments').toLowerCase()}`
    : I18n.t('common.comment.noComments').toLowerCase();
  const blogPostText = extractTextFromHtml(contentHtml);
  const blogPostMedia = extractMediaFromHtml(contentHtml);

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
              <Label text={'Billet à valider'} color={theme.color.primary.regular} labelStyle="outline" marginWidth="small" />
            ) : null}
            <ContentCardTitle>
              {title} kze jfksdlksd flks lkfdsj lksjflks vkel sdlf ieroez foiz ojselk nsdl dfsd if skdfn s
            </ContentCardTitle>
          </>
        }
        footer={
          state !== 'SUBMITTED' ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Icon style={{ marginRight: 5 }} size={18} name="chat3" color={theme.color.text.regular} />
              <TextSemiBold style={{ color: theme.color.text.light, fontSize: 12 }}>{commentsString}</TextSemiBold>
            </View>
          ) : undefined
        }>
        {blogPostText ? (
          <View style={{ marginBottom: blogPostMedia?.length ? 10 : undefined }}>
            <Text
              style={{ color: theme.color.text.regular }}
              numberOfLines={contentTextMaxLines}
              onTextLayout={({ nativeEvent: { lines } }) => {
                const isTextTruncatedWithBackspace =
                  lines.length === contentTextMaxLines && lines[contentTextMaxLines - 1].text.endsWith('\n');
                setIsTextTruncatedWithBackspace(isTextTruncatedWithBackspace);
              }}>
              {blogPostText}
            </Text>
            {isTextTruncatedWithBackspace ? <Text style={{ color: theme.color.text.regular }}>...</Text> : null}
          </View>
        ) : null}
        {blogPostMedia ? renderMediaPreview(blogPostMedia) : null}
      </TouchableResourceCard>
    </ArticleContainer>
  );
};
