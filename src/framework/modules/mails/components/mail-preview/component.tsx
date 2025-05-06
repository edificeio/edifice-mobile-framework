/* eslint-disable react-native/no-raw-text */
import * as React from 'react';
import { LayoutAnimation, TouchableOpacity, View } from 'react-native';

import moment from 'moment';
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import styles from './styles';
import { MailsMailPreviewProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { CaptionBoldText, SmallBoldText, SmallText } from '~/framework/components/text';
import MailsRecipientAvatar from '~/framework/modules/mails/components/avatar-recipient';
import { MailsMailStatePreview } from '~/framework/modules/mails/model';
import { mailsFormatRecipients } from '~/framework/modules/mails/util';
import { displayPastDate } from '~/framework/util/date';

export const MailsMailPreview = (props: MailsMailPreviewProps) => {
  const { cc, cci, date, from, hasAttachment, id, response, state, subject, to, unread } = props.data;
  const { isSelected, isSelectMode, isSender, onDelete, onPress, onRestore, onSelect, onToggleUnread } = props;

  const isUnread = unread && state !== MailsMailStatePreview.DRAFT;
  const TextComponent = isUnread ? SmallBoldText : SmallText;
  const has2SwipeActions = onToggleUnread || onRestore;
  let infosRecipients: { text: string; ids: string[] } = mailsFormatRecipients(to, cc, cci);
  const refSwipeable = React.useRef<SwipeableMethods>(null);

  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    return () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    };
  }, []);

  const onCheck = React.useCallback(() => {
    onSelect(id);
  }, [id, onSelect]);

  const renderSelectIcon = React.useCallback(() => {
    if (!isSelectMode) return null;
    return <Checkbox checked={isSelected} onPress={onCheck} customContainerStyle={styles.checkbox} />;
  }, [isSelectMode, isSelected, onCheck]);

  const renderAttachmentIcon = React.useCallback(() => {
    if (!hasAttachment) return null;
    return (
      <Svg
        name="ui-attachment"
        height={UI_SIZES.elements.icon.xxsmall}
        width={UI_SIZES.elements.icon.xxsmall}
        fill={theme.palette.grey.black}
      />
    );
  }, [hasAttachment]);

  const renderResponseIcon = React.useCallback(() => {
    if (!response && state !== MailsMailStatePreview.RECALL) return null;
    return (
      <View style={styles.responseIcon}>
        <Svg
          name={!response ? 'ui-recall' : 'ui-undo'}
          height={UI_SIZES.elements.icon.xxsmall}
          width={UI_SIZES.elements.icon.xxsmall}
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

  const renderFirstText = React.useCallback(() => {
    return (
      <TextComponent numberOfLines={1} style={styles.firstText}>
        {state === MailsMailStatePreview.DRAFT ? (
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
  }, [TextComponent, from?.displayName, infosRecipients.text, isSender, state]);

  const swipeRightAction = (prog: SharedValue<number>, drag: SharedValue<number>) => {
    const styleAnimation = useAnimatedStyle(() => {
      const widthDrag = has2SwipeActions ? 160 : 80;
      return {
        flexDirection: 'row',
        transform: [{ translateX: drag.value + widthDrag }],
      };
    });

    const onPressOtherAction = () => {
      if (onToggleUnread) onToggleUnread(id);
      else onRestore!(id);
      refSwipeable.current?.close();
    };

    if (isSelectMode) return;
    return (
      <Reanimated.View style={styleAnimation}>
        {has2SwipeActions ? (
          <TouchableOpacity onPress={onPressOtherAction} style={[styles.swipeAction, styles.swipeOtherAction]}>
            <Svg
              name={onToggleUnread ? 'ui-mailUnread' : 'ui-restore'}
              fill={theme.palette.grey.white}
              width={UI_SIZES.elements.icon.default}
              height={UI_SIZES.elements.icon.default}
            />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={() => onDelete(id)} style={[styles.swipeAction, styles.swipeDeleteAction]}>
          <Svg
            name="ui-delete"
            fill={theme.palette.grey.white}
            width={UI_SIZES.elements.icon.default}
            height={UI_SIZES.elements.icon.default}
          />
        </TouchableOpacity>
      </Reanimated.View>
    );
  };

  return (
    <ReanimatedSwipeable
      ref={refSwipeable}
      friction={1}
      enableTrackpadTwoFingerGesture
      overshootFriction={8}
      renderRightActions={swipeRightAction}>
      <TouchableOpacity
        style={[styles.container, isSelected ? styles.containerChecked : isUnread ? styles.containerUnread : {}]}
        onPress={isSelectMode ? onCheck : onPress}
        onLongPress={isSelectMode ? undefined : props.onLongPress}>
        {renderSelectIcon()}
        {renderAvatar()}
        {renderResponseIcon()}
        <View style={styles.texts}>
          <View style={styles.line}>
            {renderFirstText()}
            <CaptionBoldText style={styles.date}>{displayPastDate(moment(date))}</CaptionBoldText>
          </View>
          <View style={styles.line}>
            <TextComponent numberOfLines={1}>{subject && subject.length ? subject : I18n.get('mails-list-noobject')}</TextComponent>
            {renderAttachmentIcon()}
          </View>
        </View>
      </TouchableOpacity>
    </ReanimatedSwipeable>
  );
};
