import * as React from 'react';

import moment from 'moment';

import styles from './styles';
import { NewsCardProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { TouchableResourceCard } from '~/framework/components/card';
import CardFooter from '~/framework/components/card/footer';
import CardTopContent from '~/framework/components/card/top-content';
import { BodyText, CaptionItalicText, SmallText } from '~/framework/components/text';
import ThumbnailThread from '~/framework/modules/news/components/thumbnail-thread';
import { displayDate } from '~/framework/util/date';
import { extractTextFromHtml } from '~/framework/util/htmlParser/content';
import { commentsString } from '~/framework/util/string';
import { ArticleContainer } from '~/ui/ContainerContent';

export default function NewsCard(props: NewsCardProps) {
  const { news, thread } = props;
  const newsText = extractTextFromHtml(news.content);

  return (
    <ArticleContainer>
      <TouchableResourceCard
        onPress={props.onPress}
        footer={<CardFooter icon="ui-messageInfo" text={commentsString(news.numberOfComments)} />}>
        {thread ? (
          <CardTopContent
            image={<ThumbnailThread icon={thread.icon} square />}
            text={thread.title}
            {...(news.headline ? { statusColor: theme.palette.complementary.orange.regular, statusIcon: 'ui-star-filled' } : null)}
          />
        ) : null}
        <CaptionItalicText style={styles.date}>
          {moment(news.modified).isAfter(news.created)
            ? `${displayDate(news.modified) + I18n.get('news-details-modified')}`
            : displayDate(news.modified)}
        </CaptionItalicText>
        <BodyText numberOfLines={2}>{news.title}</BodyText>
        {newsText ? (
          <SmallText numberOfLines={2} style={styles.text}>
            {newsText}
          </SmallText>
        ) : null}
      </TouchableResourceCard>
    </ArticleContainer>
  );
}
