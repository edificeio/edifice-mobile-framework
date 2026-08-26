import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { DiscussionIcon } from '@edifice.io/community-client-rest-rn';
import { Temporal } from '@js-temporal/polyfill';

import { I18n } from '~/app/i18n';
import theme, { IShades } from '~/app/theme';
import { AvatarStack } from '~/framework/components/avatar/stack';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg, SvgIconName } from '~/framework/components/picture';
import { BodyBoldText, SmallText } from '~/framework/components/text';

import { DiscussionCardState, getCardStyle, styles } from './styles';
import { DiscussionCardProps, DiscussionCardType } from './types';

type TypeConfig = {
  color: IShades;
  icon: SvgIconName;
};

const TYPE_CONFIG: Record<DiscussionCardType, TypeConfig> = {
  [DiscussionIcon.DISCUSSION]: { color: theme.palette.complementary.blue, icon: 'ui-conversation' },
  [DiscussionIcon.EVENT]: { color: theme.palette.complementary.green, icon: 'ui-calendarLight' },
  [DiscussionIcon.IMPORTANT]: { color: theme.palette.complementary.orange, icon: 'ui-arrow-important' },
  [DiscussionIcon.OTHER]: { color: theme.palette.complementary.yellow, icon: 'ui-topic-other' },
  [DiscussionIcon.QUESTION]: { color: theme.palette.complementary.purple, icon: 'ui-question' },
};

const getStatusIcon = (isHidden?: boolean, isLocked?: boolean): SvgIconName => {
  if (isHidden) return 'ui-hide';
  if (isLocked) return 'ui-lock';
  return 'ui-messageInfo';
};

const getCardState = (isHidden?: boolean, hasNewContent?: boolean): DiscussionCardState => {
  if (isHidden) return 'hidden';
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
  isHidden,
  isLocked,
  lastMessageDate,
  membersDisplayed,
  membersTotal,
  newContent,
  onPress,
  responsesCount,
  title,
  type,
}: Readonly<DiscussionCardProps>) => {
  const showsNewContent = !!newContent?.hasNewContent && !isHidden;
  const state = getCardState(isHidden, newContent?.hasNewContent);
  const typeConfig = TYPE_CONFIG[type ?? DiscussionIcon.DISCUSSION];
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
            name={getStatusIcon(isHidden, isLocked)}
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
