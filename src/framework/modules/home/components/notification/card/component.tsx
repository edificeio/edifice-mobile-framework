import * as React from 'react';
import { ColorValue, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import { SingleAvatar } from '~/framework/components/avatar';
import { Svg, SvgIconName } from '~/framework/components/picture';
import { CaptionItalicText, SmallBoldText } from '~/framework/components/text';
import { getShownMedia } from '~/framework/modules/home/components/media-preview';
import {
  AVATAR_SIZE,
  CHIP_ICON_SIZE,
  MESSAGE_HTML_OPTIONS,
  RESOURCE_NAME_PARAMS,
  TITLE_PARAMS,
} from '~/framework/modules/home/components/notification/constants';
import { NotificationPreview } from '~/framework/modules/home/components/notification/preview';
import { useNotificationApp } from '~/framework/modules/myapps/hooks';
import { displayPastDate } from '~/framework/util/date';
import { getAsEnrichedNotification, getAsSenderNotification } from '~/framework/util/notifications';
import HtmlContentView from '~/ui/HtmlContentView';

import { cutMessageBeforeResource } from '../util';
import styles from './styles';
import { NotificationCardProps } from './types';

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
  const { badge, theme: appTheme } = useNotificationApp(notification);
  const sender = getAsSenderNotification(notification)?.sender;
  const preview = getAsEnrichedNotification(notification)?.preview;

  const media = React.useMemo(() => getShownMedia(preview?.media ?? [], true), [preview?.media]);

  const params = notification.backupData?.params ?? {};
  const resourceName = firstParam(params, RESOURCE_NAME_PARAMS);
  const title = firstParam(params, TITLE_PARAMS);

  const previewName = resourceName ?? title;
  const previewTitle = resourceName ? title : undefined;

  const message = React.useMemo(
    () => (media.length ? cutMessageBeforeResource(notification.message ?? '') : notification.message),
    [media.length, notification.message],
  );

  const appName = I18n.get(`timeline-apptype-${notification.type}`.toLowerCase().replaceAll('_', '-'));

  const showChip = !media.length && !!sender?.id;

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
          {showChip ? (
            <NotificationChip
              background={appTheme?.colors.pale}
              color={badge?.color}
              icon={badge?.icon as SvgIconName}
              name={appName}
            />
          ) : null}
          {media.length ? null : date}
        </View>
      </View>
      {media.length ? (
        <NotificationPreview
          badge={badge}
          colors={appTheme?.colors}
          media={media}
          resourceName={previewName ?? appName}
          text={preview?.text}
          title={previewTitle}
        />
      ) : null}
      {media.length ? date : null}
    </Container>
  );
});
