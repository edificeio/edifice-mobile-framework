import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { MailsContactItemProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { accountTypeInfos } from '~/framework/util/accountType';

export const MailsContactItem = (props: MailsContactItemProps) => {
  const onDelete = () => {
    props.onDelete(props.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar} />
      <SmallText>
        <SmallBoldText>{props.name}</SmallBoldText>
        {' - '}
        <SmallBoldText style={{ color: accountTypeInfos[props.type].color.regular }}>
          {accountTypeInfos[props.type].text}
        </SmallBoldText>
      </SmallText>
      {props.isEditing ? (
        <TouchableOpacity onPress={onDelete}>
          <Svg
            name="ui-close"
            fill={theme.palette.grey.black}
            width={UI_SIZES.elements.icon.small}
            height={UI_SIZES.elements.icon.small}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
