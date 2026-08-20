import * as React from 'react';
import { ColorValue, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { SingleAvatar } from '~/framework/components/avatar';
import { Svg, SvgIconName } from '~/framework/components/picture';
import { CaptionItalicText, SmallBoldText, SmallItalicText } from '~/framework/components/text';
import {
  AVATAR_SIZE,
  CHIP_ICON_SIZE,
  MESSAGE_HTML_OPTIONS,
  RESOURCE_NAME_PARAMS,
  THEME_DEGREE,
  TITLE_PARAMS,
} from '~/framework/modules/home/components/notification/constants';
import { NotificationPreview } from '~/framework/modules/home/components/notification/preview';
import { Image } from '~/framework/modules/media/components/image';
import { useNotificationAppTheme, useNotificationBadge } from '~/framework/modules/myapps/hooks';
import { renderMoodPicture } from '~/framework/modules/user/screens/profile/edit-moodmotto';
import { displayPastDate } from '~/framework/util/date';
import { getAsEnrichedNotification, getAsSenderNotification } from '~/framework/util/notifications';
import HtmlContentView from '~/ui/HtmlContentView';

import { cutMessageAtNames } from '../util';
import styles from './styles';
import { NotificationCardProps } from './types';

type MoodName = keyof (typeof renderMoodPicture)['2d'];

// First of those params the notification carries. Each app names its content its own way.
const firstParam = (params: Record<string, string | undefined>, keys: string[]) =>
  keys.map(key => params[key]).find(value => !!value);

const NotificationChip = React.memo(
  ({ background, color, icon, name }: { background?: ColorValue; color?: ColorValue; icon?: SvgIconName; name: string }) => {
    const chipStyle = React.useMemo(() => [styles.chip, background ? { backgroundColor: background } : null], [background]);
    const textStyle = React.useMemo(() => [styles.chipText, color ? { color } : null], [color]);

    return (
      <View style={chipStyle}>
        {icon ? <Svg name={icon} fill={color} width={CHIP_ICON_SIZE} height={CHIP_ICON_SIZE} /> : null}
        <SmallBoldText style={textStyle} numberOfLines={1}>
          {name}
        </SmallBoldText>
      </View>
    );
  },
);

export const NotificationCard = React.memo(({ notification, onPress }: NotificationCardProps) => {
  const badge = useNotificationBadge(notification.type, notification['event-type']);
  const appTheme = useNotificationAppTheme(notification.type, notification['event-type']);
  const sender = getAsSenderNotification(notification)?.sender;
  const preview = getAsEnrichedNotification(notification)?.preview;
  const media = preview?.media;

  const params = notification.backupData?.params ?? {};
  const resourceName = firstParam(params, RESOURCE_NAME_PARAMS);
  const title = firstParam(params, TITLE_PARAMS);

  const degree = THEME_DEGREE[theme.level];

  const mood = notification.type === 'USERBOOK_MOOD' ? (params.moodImg as MoodName) : undefined;
  const motto = notification.type === 'USERBOOK_MOTTO' ? params.motto : undefined;

  // One set of pictures per degree, one picture per mood, as on the timeline.
  const moodPicture = mood ? renderMoodPicture[degree][mood] : undefined;

  const previewName = resourceName ?? title;
  const previewTitle = resourceName ? title : undefined;

  const message = React.useMemo(() => {
    // A mood is worded differently in each degree, so the sentence is built here, not on the back.
    if (mood) return `<a>${params.username}</a> ${I18n.get(`timeline-notiftype-mood-${mood}-${degree}`)}`;
    if (motto) return `<a>${params.username}</a> ${I18n.get('timeline-notiftype-motto')}`;
    // The preview already shows those names, the message must not repeat them.
    return media?.length ? cutMessageAtNames(notification.message ?? '', [resourceName, title]) : notification.message;
  }, [degree, media?.length, mood, motto, notification.message, params.username, resourceName, title]);

  const appName = I18n.get(`timeline-apptype-${notification.type}`.toLowerCase().replaceAll('_', '-'));

  const showChip = !media?.length && !!sender?.id && !mood;

  const Container = onPress ? TouchableOpacity : View;

  const date = <CaptionItalicText style={styles.date}>{displayPastDate(notification.date)}</CaptionItalicText>;

  return (
    <Container style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        {sender?.id ? (
          <SingleAvatar userId={sender.id} size="sm" />
        ) : (
          <Svg name={badge?.icon as SvgIconName} fill={badge?.color} width={AVATAR_SIZE} height={AVATAR_SIZE} />
        )}
        <View style={styles.message}>
          <HtmlContentView html={message} opts={MESSAGE_HTML_OPTIONS} />
          {motto ? <SmallItalicText>{`"${motto}"`}</SmallItalicText> : null}
          {showChip ? (
            <NotificationChip
              background={appTheme?.colors.pale}
              color={badge?.color}
              icon={badge?.icon as SvgIconName}
              name={appName}
            />
          ) : null}
          {media?.length ? null : date}
        </View>
        {moodPicture ? (
          <View style={styles.mood}>
            <Image source={moodPicture} style={styles.moodImage} />
          </View>
        ) : null}
      </View>
      {media?.length ? (
        <NotificationPreview
          badge={badge}
          colors={appTheme?.colors}
          media={media}
          resourceName={previewName ?? appName}
          text={preview?.text}
          title={previewTitle}
        />
      ) : null}
      {media?.length ? date : null}
    </Container>
  );
});
