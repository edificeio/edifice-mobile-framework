import * as React from 'react';
import { View } from 'react-native';
import I18n from 'i18n-js';
import { Moment } from 'moment';

import theme from '~/app/theme';
import { ContentCardHeader, ContentCardIcon, TouchableResourceCard } from '~/framework/components/card';
import { ArticleContainer } from '~/ui/ContainerContent';
import { Icon } from '../../../framework/components/icon';
import { Text, TextSemiBold } from '../../../framework/components/text';
import { extractMediaFromHtml, extractTextFromHtml, renderMediaPreview } from '~/framework/util/htmlParser/content';

export interface IBlogPostResourceCardProps {
  action: () => void;
  authorId: string;
  authorName: string;
  comments: number;
  contentHtml: string;
  date: Moment;
  title: string;
}

export const BlogPostResourceCard = ({
  action,
  authorId,
  authorName,
  comments,
  contentHtml,
  date,
  title,
}: IBlogPostResourceCardProps) => {
  const [isTextTruncatedWithBackspace, setIsTextTruncatedWithBackspace] = React.useState(false);
  const authorTextMaxLines = 1;
  const contentTextMaxLines = 5;
  const commentsString = comments
    ? comments === 1
      ? `1 ${I18n.t('common.comment').toLowerCase()}`
      : `${comments} ${I18n.t('common.comments').toLowerCase()}`
    : I18n.t('common.noComments').toLowerCase();
  const blogPostText = extractTextFromHtml(contentHtml);
  const blogPostMedia = extractMediaFromHtml(contentHtml);

  return (
    <ArticleContainer>
      <TouchableResourceCard
        onPress={action}
        header={
          <ContentCardHeader
            icon={<ContentCardIcon userIds={[authorId || require('ASSETS/images/system-avatar.png')]} />}
            text={authorName
              ? <TextSemiBold numberOfLines={authorTextMaxLines}>{`${I18n.t('common.by')} ${authorName}`}</TextSemiBold>
              : undefined
            }
            date={date}
          />
        }
        title={title}
        footer={
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Icon style={{ marginRight: 5 }} size={18} name="chat3" color={theme.color.text.regular} />
            <TextSemiBold style={{ color: theme.color.text.light, fontSize: 12 }}>{commentsString}</TextSemiBold>
          </View>
        }
      >
        {blogPostText
          ? <View style={{ marginBottom: blogPostMedia?.length ? 10 : undefined }}>
              <Text
                style={{ color: theme.color.text.regular }}
                numberOfLines={contentTextMaxLines}
                onTextLayout={({ nativeEvent: { lines } }) => {
                  const isTextTruncatedWithBackspace = lines.length === contentTextMaxLines && lines[contentTextMaxLines-1].text.endsWith("\n");
                  setIsTextTruncatedWithBackspace(isTextTruncatedWithBackspace);
                }}
              >
                {blogPostText}
              </Text>
              {isTextTruncatedWithBackspace
                ? <Text style={{ color: theme.color.text.regular }}>...</Text>
                : null
              }
            </View>
          : null
        }
        {blogPostMedia ? renderMediaPreview(blogPostMedia) : null}
      </TouchableResourceCard>
    </ArticleContainer>
  );
};
