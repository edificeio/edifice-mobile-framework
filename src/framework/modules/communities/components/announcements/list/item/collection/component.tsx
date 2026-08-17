import React from 'react';
import { View } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';

import { I18n } from '~/app/i18n';
import { getScaleWidth, UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { Svg, SvgIconName } from '~/framework/components/picture';
import { BodyText, CaptionText, HeadingLText, SmallText } from '~/framework/components/text';

import { CollectionStatusColors, getCollectionStatus } from './status';
import styles from './styles';
import { CollectionItemProps } from './types';

const CALENDAR_TOP_HEIGHT = getScaleWidth(12);
const CALENDAR_TOP_WIDTH = getScaleWidth(34);

const DeadlineBadge = ({
  colors,
  deadline,
  isCompleted,
}: Readonly<{ colors: CollectionStatusColors; deadline: Temporal.Instant; isCompleted: boolean }>) => {
  const { day, month } = React.useMemo(() => {
    const language = I18n.getLanguage();
    const shortMonth = deadline.toLocaleString(language, { month: 'short' });

    return {
      day: deadline.toLocaleString(language, { day: 'numeric' }),
      month: shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1),
    };
  }, [deadline]);
  const contentStyle = { color: colors.content };

  return (
    <View style={[styles.dateBadge, { backgroundColor: colors.background }]}>
      <Svg name="ui-calendar-top" width={CALENDAR_TOP_WIDTH} height={CALENDAR_TOP_HEIGHT} style={styles.calendarTop} />
      {isCompleted ? (
        <Svg
          name={'rack'}
          width={UI_SIZES.elements.icon.small * 2}
          height={UI_SIZES.elements.icon.small * 2}
          fill={colors.content}
        />
      ) : (
        <>
          <HeadingLText style={[styles.day, contentStyle]}>{day}</HeadingLText>
          <CaptionText style={[styles.month, contentStyle]}>{month}</CaptionText>
        </>
      )}
    </View>
  );
};

const StatusPill = ({
  colors,
  icon,
  isCompleted,
  text,
}: Readonly<{ colors: CollectionStatusColors; icon?: SvgIconName; isCompleted: boolean; text: string }>) => {
  const contentStyle = { color: isCompleted ? colors.dark : colors.content };

  return (
    <View style={[styles.pill, { backgroundColor: colors.background }]}>
      {icon ? (
        <Svg
          name={icon}
          width={UI_SIZES.elements.icon.xsmall}
          height={UI_SIZES.elements.icon.xsmall}
          fill={isCompleted ? colors.dark : colors.content}
        />
      ) : null}
      <SmallText style={contentStyle}>{text}</SmallText>
    </View>
  );
};

const CollectionItem = ({ announcement, style, userRole }: Readonly<CollectionItemProps>) => {
  const { collection, date, submission } = announcement;
  const name = collection?.name ?? submission?.name;
  const deadline = collection?.deadline ?? submission?.deadline;
  const { adminCollection, colors, isCompleted } = getCollectionStatus(announcement, userRole);

  const displayedDate = React.useMemo(
    () => (date ? I18n.get('communities-collect-distributed', { date: I18n.date(date) }) : ''),
    [date],
  );
  // The API sends ISO strings even though the DTO types them as Date.
  const deadlineInstant = React.useMemo(
    () => (deadline ? Temporal.Instant.from(deadline as unknown as string) : undefined),
    [deadline],
  );
  const displayedDeadline = React.useMemo(() => (deadlineInstant ? I18n.date(deadlineInstant) : ''), [deadlineInstant]);
  if (!name || !deadlineInstant)
    return (
      <View style={style}>
        <SmallText>{I18n.get('communities-collect-unavailable')}</SmallText>
      </View>
    );

  return (
    <View style={style}>
      <View style={styles.header}>
        <DeadlineBadge colors={colors} deadline={deadlineInstant} isCompleted={isCompleted} />
        <View style={UI_STYLES.flex1}>
          <BodyText numberOfLines={1}>{name}</BodyText>
          <SmallText style={styles.distributedDate}>{displayedDate}</SmallText>
        </View>
      </View>
      {adminCollection ? (
        <StatusPill
          colors={colors}
          isCompleted={isCompleted}
          text={`${adminCollection.contribCount} / ${adminCollection.submissionCount}`}
        />
      ) : (
        <StatusPill
          colors={colors}
          icon={'ui-inbox-hand'}
          isCompleted={isCompleted}
          text={
            isCompleted
              ? I18n.get('communities-collect-submitted')
              : I18n.get('communities-collect-deadline', { date: displayedDeadline })
          }
        />
      )}
    </View>
  );
};

export default CollectionItem;
