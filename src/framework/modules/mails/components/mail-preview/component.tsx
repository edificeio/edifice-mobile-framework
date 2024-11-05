import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import moment from 'moment';

import styles from './styles';
import { MailsMailPreviewProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { CaptionBoldText, SmallBoldText, SmallText } from '~/framework/components/text';
import { displayPastDate } from '~/framework/util/date';
import Avatar, { Size } from '~/ui/avatars/Avatar';

export const MailsMailPreview = (props: MailsMailPreviewProps) => {
  const TextComponent = props.data.unread ? SmallBoldText : SmallText;

  return (
    <TouchableOpacity style={[styles.container, props.data.unread ? styles.containerUnread : {}]}>
      <Avatar size={Size.large} sourceOrId={props.data.from.id} id="" />
      {props.data.type === 'ANSWERED' ? (
        <View style={styles.responseIcon}>
          <NamedSVG
            name="ui-undo"
            height={UI_SIZES.elements.icon.xsmall}
            width={UI_SIZES.elements.icon.xsmall}
            fill={theme.palette.grey.black}
          />
        </View>
      ) : null}
      <View style={styles.texts}>
        <View style={styles.line}>
          <TextComponent>
            {props.data.state === 'DRAFT' ? 'Brouillon' : ''} {props.data.from.displayName}
          </TextComponent>
          <CaptionBoldText style={styles.date}>{displayPastDate(moment(props.data.date))}</CaptionBoldText>
        </View>
        <View style={styles.line}>
          <TextComponent>{props.data.subject}</TextComponent>
          {props.data.hasAttachment ? (
            <NamedSVG
              name="ui-attachment"
              height={UI_SIZES.elements.icon.xsmall}
              width={UI_SIZES.elements.icon.xsmall}
              fill={theme.palette.grey.black}
            />
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};
