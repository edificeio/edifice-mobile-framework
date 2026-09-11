import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { DiscussionIcon } from '@edifice.io/community-client-rest-rn';
import { Temporal } from '@js-temporal/polyfill';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { AvatarStack } from '~/framework/components/avatar/stack';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText, SmallText } from '~/framework/components/text';
import { DISCUSSION_TYPE_CONFIG, DiscussionStatus, getDiscussionStatusIcon } from '~/framework/modules/communities/utils';

import { DiscussionCardState, getCardStyle, styles } from './styles';
import { DiscussionCardProps } from './types';

const getCardState = (status?: DiscussionStatus, hasNewContent?: boolean): DiscussionCardState => {
  if (status === 'hidden') return 'hidden';
  if (hasNewContent) return 'new';
  return 'default';
};

const getNewMessagesSubtitle = (messagesCount: number): string => {
  const i18nKey = messagesCount === 1 ? 'communities-discussioncard-newmessage' : 'communities-discussioncard-newmessages';
  return I18n.get(i18nKey, { count: messagesCount });
};

const getSubtitle = (hasNewContent: boolean, messagesCount?: number, lastMessageDate?: Temporal.Instant): string => {
  if (hasNewContent) return getNewMessagesSubtitle(messagesCount ?? 0);
  if (lastMessageDate) return I18n.get('communities-discussioncard-lastmessage', { date: I18n.date(lastMessageDate) });
  return '';
};

const AVATAR_SIZE = 'sm';

export const DiscussionCard = ({
  lastMessageDate,
  membersDisplayed,
  membersTotal,
  newContent,
  onPress,
  responsesCount,
  status,
  title,
  type,
}: Readonly<DiscussionCardProps>) => {
  const showsNewContent = !!newContent?.hasNewContent && status !== 'hidden';
  const state = getCardState(status, newContent?.hasNewContent);
  const typeConfig = DISCUSSION_TYPE_CONFIG[type ?? DiscussionIcon.DISCUSSION];
  const cardStyle = React.useMemo(() => [getCardStyle(state)], [state]);
  const subtitle = getSubtitle(showsNewContent, newContent?.messagesCount, lastMessageDate);

  return (
    <TouchableOpacity style={cardStyle} onPress={onPress} testID="community-discussion-card">
      <View style={styles.topRow}>
        <View style={[styles.iconSquare, { backgroundColor: typeConfig.color.pale }]}>
          <Svg
            fill={typeConfig.color.regular}
            height={UI_SIZES.elements.icon.medium}
            name={typeConfig.icon}
            width={UI_SIZES.elements.icon.medium}
          />
        </View>
        <View style={styles.content}>
          <BodyBoldText numberOfLines={1} ellipsizeMode="tail">
            {title}
          </BodyBoldText>
          {subtitle ? (
            <SmallText style={showsNewContent ? styles.subtitleNew : styles.subtitleDefault}>{subtitle}</SmallText>
          ) : null}
        </View>
        {showsNewContent ? <View style={styles.redDot} /> : null}
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.bottomRowLeft}>
          <Svg
            fill={theme.palette.grey.black}
            height={UI_SIZES.elements.icon.small}
            name={getDiscussionStatusIcon(status)}
            width={UI_SIZES.elements.icon.small}
          />
          <SmallText style={styles.responseDefault}>
            {I18n.get(responsesCount === 1 ? 'communities-discussioncard-response' : 'communities-discussioncard-responses', {
              count: responsesCount,
            })}
          </SmallText>
        </View>
        <AvatarStack
          items={membersDisplayed}
          overlayI18nKey="avatar-count"
          size={AVATAR_SIZE}
          style={styles.avatarStack}
          total={membersTotal}
        />
      </View>
    </TouchableOpacity>
  );
};
