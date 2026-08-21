import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { SingleAvatar } from '~/framework/components/avatar';
import { CaptionItalicText, SmallItalicText } from '~/framework/components/text';
import {
  MESSAGE_HTML_OPTIONS,
  MOOD_I18N_KEYS,
  MoodName,
  THEME_DEGREE,
  USERBOOK_MOOD,
} from '~/framework/modules/home/components/notification/constants';
import { Image } from '~/framework/modules/media/components/image';
import { renderMoodPicture } from '~/framework/modules/user/screens/profile/edit-moodmotto';
import { displayPastDate } from '~/framework/util/date';
import HtmlContentView from '~/ui/HtmlContentView';

import styles from './styles';
import { NotificationCardProps } from './types';

export const UserbookNotificationCard = React.memo(({ notification, onPress }: NotificationCardProps) => {
  const params = notification.backupData?.params ?? {};
  const author = notification.backupData?.sender;
  const isMood = notification.type === USERBOOK_MOOD;

  const mood = MOOD_I18N_KEYS[params.moodImg as MoodName] ?? MOOD_I18N_KEYS.default;
  const said = isMood ? I18n.get(mood[THEME_DEGREE[theme.level]]) : I18n.get('timeline-notiftype-motto');
  const message = `<a>${params.username}</a> ${said}`;

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        {author ? <SingleAvatar userId={author} size="sm" /> : null}
        <View style={styles.message}>
          <HtmlContentView html={message} opts={MESSAGE_HTML_OPTIONS} />
          {isMood ? null : <SmallItalicText>{`"${params.motto}"`}</SmallItalicText>}
          <CaptionItalicText style={styles.date}>{displayPastDate(notification.date)}</CaptionItalicText>
        </View>
        {isMood ? (
          <View style={styles.mood}>
            <Image source={renderMoodPicture[THEME_DEGREE[theme.level]][params.moodImg as MoodName]} style={styles.moodImage} />
          </View>
        ) : null}
      </View>
    </Container>
  );
});
