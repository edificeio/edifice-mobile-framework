import * as React from 'react';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { EmptyScreen } from '~/framework/components/emptyScreen';

export const NoNewsScreen = (props: { createNews?: boolean; createThreads?: boolean }) => {
  if (props.createNews)
    return (
      <EmptyScreen
        svgImage="empty-news"
        title={I18n.get('news-home-noContent-title')}
        text={I18n.get('news-home-noContentCreateNews-text')}
        textColor={theme.palette.grey.black}
        buttonText={I18n.get('news-home-createNewsButton')}
        buttonUrl="/actualites#/default"
      />
    );
  if (props.createThreads)
    return (
      <EmptyScreen
        svgImage="empty-news"
        title={I18n.get('news-home-noContent-title')}
        text={I18n.get('news-home-noContentCreateThread-text')}
        textColor={theme.palette.grey.black}
        buttonText={I18n.get('news-home-createThreadButton')}
        buttonUrl="/actualites#/admin"
      />
    );
  return (
    <EmptyScreen
      svgImage="empty-news"
      title={I18n.get('news-home-noContent-title')}
      text={I18n.get('news-home-noContent-text')}
      textColor={theme.palette.grey.black}
    />
  );
};
