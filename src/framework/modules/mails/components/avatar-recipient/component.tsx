import React from 'react';
import { View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';

import Avatar, { Size } from '~/ui/avatars/Avatar';
import styles from './styles';
import { MailsRecipientAvatarProps } from './types';

const iconType = {
  ['ShareBookmark']: 'ui-bookmark',
  ['Group']: 'ui-users',
  ['User']: 'ui-question',
  ['BroadcastGroup']: 'ui-globe',
};

const MailsRecipientAvatar = (props: MailsRecipientAvatarProps) => {
  const { id, type, size } = props;

  if (type === 'User' && id) return <Avatar size={Size.large} sourceOrId={id} id="" />;
  const suppViewStyles: ViewStyle = {
    width: UI_SIZES.elements.avatar.lg,
    aspectRatio: 1,
  };
  return (
    <View style={[suppViewStyles, styles.view, type === 'ShareBookmark' ? styles.bookmark : {}]}>
      <Svg
        name={iconType[type]}
        height={UI_SIZES.elements.icon.xsmall}
        width={UI_SIZES.elements.icon.xsmall}
        fill={theme.palette.grey.black}
      />
    </View>
  );
};

export default MailsRecipientAvatar;
