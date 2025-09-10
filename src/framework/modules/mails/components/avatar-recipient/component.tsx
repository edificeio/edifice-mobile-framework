import React from 'react';
import { View, ViewStyle } from 'react-native';

import styles from './styles';
import { MailsRecipientAvatarProps } from './types';

import theme from '~/app/theme';
import { SingleAvatar } from '~/framework/components/avatar';
import { AvatarSizes } from '~/framework/components/avatar/styles';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';

export const getRecipientIconName = (type: string | undefined): string => {
  switch (type) {
    case 'BroadcastGroup':
      return 'ui-globe';
    case 'ShareBookmark':
      return 'ui-bookmark';
    case 'User':
      return 'ui-questionMark';
    default:
      return 'ui-users';
  }
};

const MailsRecipientAvatar = (props: MailsRecipientAvatarProps) => {
  const { id, type } = props;

  if (type === 'User' && id) return <SingleAvatar size={props.size ?? 'md'} userId={id} />;

  const suppViewStyles: ViewStyle = {
    aspectRatio: 1,
    width: AvatarSizes[props.size ?? 'md'],
  };

  return (
    <View style={[suppViewStyles, styles.view, type === 'ShareBookmark' ? styles.bookmark : type === 'User' ? styles.noUser : {}]}>
      <Svg
        name={getRecipientIconName(type)}
        height={UI_SIZES.elements.icon.xsmall}
        width={UI_SIZES.elements.icon.xsmall}
        fill={theme.palette.grey.black}
      />
    </View>
  );
};

export default MailsRecipientAvatar;
