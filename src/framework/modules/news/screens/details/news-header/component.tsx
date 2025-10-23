import React from 'react';

import moment from 'moment';

import { NewsHeaderProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { ResourceView } from '~/framework/components/card';
import CardFooter from '~/framework/components/card/footer';
import CardTopContent from '~/framework/components/card/top-content';
import { UI_SIZES } from '~/framework/components/constants';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text';
import { CaptionItalicText, HeadingSText } from '~/framework/components/text';
import { TextAvatar } from '~/framework/components/textAvatar';
import ThumbnailThread from '~/framework/modules/news/components/thumbnail-thread';
import styles from '~/framework/modules/news/screens/details/styles';
import { displayDate } from '~/framework/util/date';
import { commentsString } from '~/framework/util/string';
import { formatLegacyHtmlContent } from '~/utils/formatHtmlContent';

const NewsHeader = React.memo<NewsHeaderProps>(({ commentsCount = 0, news, thread }) => {
  if (!news || !thread) return null;

  return (
    <ResourceView
      header={
        <CardTopContent
          image={<ThumbnailThread icon={thread.icon} square />}
          text={thread.title}
          {...(news.headline ? { statusColor: theme.palette.complementary.orange.regular, statusIcon: 'ui-star-filled' } : null)}
          style={styles.detailsHeaderTopContent}
        />
      }
      customHeaderStyle={styles.detailsHeader}
      footer={<CardFooter icon="ui-messageInfo" text={commentsString(commentsCount)} />}
      style={styles.ressourceView}>
      <CaptionItalicText style={styles.detailsDate}>
        {moment(news.modified).isAfter(news.created)
          ? `${displayDate(news.modified)} ${I18n.get('news-details-modified')}`
          : displayDate(news.modified)}
      </CaptionItalicText>

      <HeadingSText>{news.title}</HeadingSText>

      <TextAvatar
        text={news.owner.displayName}
        userId={news.owner.id}
        isHorizontal
        size={UI_SIZES.elements.icon.default}
        viewStyle={styles.detailsOwner}
      />
      <RichEditorViewer content={formatLegacyHtmlContent(news.content)} />
    </ResourceView>
  );
});

export default NewsHeader;
