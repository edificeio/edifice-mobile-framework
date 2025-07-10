import * as React from 'react';

import { CheckboxButtonProps } from './types';

import { I18n } from '~/app/i18n';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_STYLES } from '~/framework/components/constants';
import { ListItem } from '~/framework/components/listItem';
import { SmallText } from '~/framework/components/text';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

export const CheckboxButton = ({
  checked,
  customContainerStyle,
  customListItemStyle,
  onPress,
  partialyChecked,
  TextComponent = SmallText,
  title,
}: Readonly<CheckboxButtonProps>) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <ListItem
        style={customListItemStyle}
        leftElement={<TextComponent style={UI_STYLES.flexShrink1}>{I18n.get(title)}</TextComponent>}
        rightElement={
          <Checkbox
            checked={checked}
            partialyChecked={partialyChecked}
            onPress={onPress}
            customContainerStyle={customContainerStyle}
          />
        }
      />
    </TouchableOpacity>
  );
};
