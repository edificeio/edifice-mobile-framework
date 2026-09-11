import * as React from 'react';
import { View } from 'react-native';

import { DiscussionIcon } from '@edifice.io/community-client-rest-rn';

import { I18n } from '~/app/i18n';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { HeadingSText, SmallItalicText } from '~/framework/components/text';
import AuthorLine from '~/framework/modules/communities/components/discussions/author-line';
import { DISCUSSION_TYPE_CONFIG } from '~/framework/modules/communities/utils';
import { formatDateConvivialHourless } from '~/framework/util/date';

import styles, { TYPE_STYLES } from './styles';
import { DiscussionHeaderProps } from './types';

const TITLE_NUMBER_OF_LINES = 3;
const FALLBACK_TYPE = DiscussionIcon.DISCUSSION;

const DiscussionHeader = ({ authorName, authorProfile, createdAt, title, type }: Readonly<DiscussionHeaderProps>) => {
  const safeType = type in DISCUSSION_TYPE_CONFIG ? type : FALLBACK_TYPE;
  const typeConfig = DISCUSSION_TYPE_CONFIG[safeType];
  const typeStyles = TYPE_STYLES[safeType];

  return (
    <View style={typeStyles.container}>
      <HeadingSText ellipsizeMode="tail" numberOfLines={TITLE_NUMBER_OF_LINES}>
        {title}
      </HeadingSText>
      <AuthorLine name={authorName} profile={authorProfile} style={styles.authorRow} />
      <View style={styles.overflowRow}>
        <View style={typeStyles.iconSquare}>
          <Svg
            fill={typeConfig.color.regular}
            height={UI_SIZES.elements.icon.default}
            name={typeConfig.icon}
            width={UI_SIZES.elements.icon.default}
          />
        </View>
        <SmallItalicText style={styles.date}>
          {createdAt ? formatDateConvivialHourless(createdAt) : I18n.get('date-invalid')}
        </SmallItalicText>
      </View>
    </View>
  );
};

export default React.memo(DiscussionHeader);
