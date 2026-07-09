import * as React from 'react';
import { GestureResponderEvent, Pressable, View } from 'react-native';

import moment from 'moment';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { CaptionBoldText, SmallBoldText, SmallText } from '~/framework/components/text';
import MailsRecipientAvatar from '~/framework/modules/mails/components/avatar-recipient';
import { MailsMailStatePreview } from '~/framework/modules/mails/model';
import { mailsFormatRecipients, renderSubject } from '~/framework/modules/mails/util';
import { displayPastDate } from '~/framework/util/date';

import styles from './styles';
import { MailsMailPreviewProps } from './types';

export const MailsMailPreview = React.memo((props: MailsMailPreviewProps) => {
  const { cc, cci, date, from, hasAttachment, id, response, state, subject, to, unread } = props.data;
  const { isInPersonalFolder, isSelected, isSelectMode, isSender, isTrashed, onLongPress, onPress, onSelect } = props;

  const isUnread = unread && state !== MailsMailStatePreview.DRAFT;
  const isDraft = state === MailsMailStatePreview.DRAFT;
  const TextComponent = isUnread ? SmallBoldText : SmallText;
  const infosRecipients: { text: string; ids: string[] } = React.useMemo(() => mailsFormatRecipients(to, cc, cci), [to, cc, cci]);

  const onCheck = React.useCallback(() => {
    onSelect(id);
  }, [id, onSelect]);

  const renderSelectIcon = React.useCallback(() => {
    if (!isSelectMode) return null;
    return <Checkbox checked={isSelected} onPress={onCheck} onLongPress={onCheck} customContainerStyle={styles.checkbox} />;
  }, [isSelectMode, isSelected, onCheck]);

  const renderAttachmentIcon = React.useCallback(() => {
    if (!hasAttachment) return null;
    return (
      <Svg
        name="ui-attachment"
        height={UI_SIZES.elements.icon.xsmall}
        width={UI_SIZES.elements.icon.xsmall}
        fill={theme.palette.grey.black}
      />
    );
  }, [hasAttachment]);

  const renderIcon = React.useCallback(() => {
    if (!response && state !== MailsMailStatePreview.RECALL) return null;
    return (
      <View style={styles.responseIcon}>
        <Svg
          name={!response ? 'ui-recall' : 'ui-undo'}
          height={UI_SIZES.elements.icon.xsmall}
          width={UI_SIZES.elements.icon.xsmall}
          fill={theme.palette.grey.black}
        />
      </View>
    );
  }, [response, state]);

  const renderAvatar = React.useCallback(() => {
    if (isSender && infosRecipients.ids.length > 1) return <MailsRecipientAvatar type="Group" />;
    if (isSender) return <MailsRecipientAvatar type="User" id={infosRecipients.ids[0]} />;
    return <MailsRecipientAvatar type="User" id={from?.id} />;
  }, [from?.id, infosRecipients.ids, isSender]);

  const renderDefaultFolder = React.useCallback(() => {
    if (!isInPersonalFolder && !isTrashed) return null;
    const iconName = isDraft ? 'ui-edit' : isSender ? 'ui-send' : 'ui-depositeInbox';
    return (
      <View style={styles.defaultFolder}>
        <Svg
          name={iconName}
          height={UI_SIZES.elements.icon.xsmall}
          width={UI_SIZES.elements.icon.xsmall}
          fill={theme.palette.grey.black}
        />
      </View>
    );
  }, [isDraft, isInPersonalFolder, isSender, isTrashed]);

  const renderFirstText = React.useCallback(() => {
    return (
      <TextComponent numberOfLines={1} style={styles.firstText}>
        {isDraft ? (
          <>
            <SmallBoldText style={styles.draftText}>
              {I18n.get('mails-list-draft')}
              {'  '}
            </SmallBoldText>
            {infosRecipients.text}
          </>
        ) : isSender ? (
          infosRecipients.text
        ) : (
          (from?.displayName ?? '')
        )}
      </TextComponent>
    );
  }, [TextComponent, from?.displayName, infosRecipients.text, isDraft, isSender]);

  const displayDate = React.useMemo(() => displayPastDate(moment(date)), [date]);

  const handleInteraction = React.useCallback(
    (e: GestureResponderEvent, type: 'press' | 'longPress') => {
      e.stopPropagation();

      if (isSelectMode) {
        onCheck();
        return;
      }

      if (type === 'press') {
        onPress();
      } else {
        onLongPress?.();
      }
    },
    [isSelectMode, onCheck, onPress, onLongPress],
  );

  const handlePress = React.useCallback((e: GestureResponderEvent) => handleInteraction(e, 'press'), [handleInteraction]);

  const handleLongPress = React.useCallback((e: GestureResponderEvent) => handleInteraction(e, 'longPress'), [handleInteraction]);
  return (
    <Pressable
      style={[styles.container, isSelected ? styles.containerChecked : isUnread ? styles.containerUnread : {}]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={150}>
      {renderSelectIcon()}
      {renderAvatar()}
      {renderDefaultFolder()}
      {renderIcon()}
      <View style={styles.texts}>
        <View style={styles.line}>
          {renderFirstText()}
          <CaptionBoldText style={styles.date}>{displayDate}</CaptionBoldText>
        </View>
        <View style={styles.line}>
          <TextComponent numberOfLines={1} style={styles.firstText}>
            {renderSubject(subject, state === MailsMailStatePreview.RECALL)}
          </TextComponent>
          {renderAttachmentIcon()}
        </View>
      </View>
    </Pressable>
  );
});
