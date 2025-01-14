import React from 'react';
import { View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';

import { AvatarSize, NewAvatar, NewAvatarSizes } from '~/framework/components/newavatar';
import styles from './styles';
import { MailsRecipientAvatarProps } from './types';

const iconType = {
  ['ShareBookmark']: 'ui-bookmark',
  ['Group']: 'ui-users',
  ['User']: 'ui-questionMark',
  ['BroadcastGroup']: 'ui-globe',
};

const MailsRecipientAvatar = (props: MailsRecipientAvatarProps) => {
  const { id, type } = props;

  if (type === 'User' && id) return <NewAvatar userId={id} />;
  const suppViewStyles: ViewStyle = {
    width: NewAvatarSizes[AvatarSize.md],
    aspectRatio: 1,
  };
  return (
    <View style={[suppViewStyles, styles.view, type === 'ShareBookmark' ? styles.bookmark : type === 'User' ? styles.noUser : {}]}>
      <Svg
        name={iconType[type === 'User' ? type : 'Group']}
        height={UI_SIZES.elements.icon.xxsmall}
        width={UI_SIZES.elements.icon.xxsmall}
        fill={theme.palette.grey.black}
      />
    </View>
  );
};

export default MailsRecipientAvatar;
