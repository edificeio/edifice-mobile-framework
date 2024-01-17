import * as React from 'react';
import { ViewStyle } from 'react-native';

import { I18n } from '~/app/i18n';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_STYLES } from '~/framework/components/constants';
import { ListItem } from '~/framework/components/listItem';
import { SmallText } from '~/framework/components/text';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

export const CheckboxButton = ({
  onPress,
  title,
  isChecked,
  customCheckboxContainerStyle,
  customListItemStyle,
}: {
  onPress: () => any;
  title: string;
  isChecked: boolean;
  customCheckboxContainerStyle?: ViewStyle;
  customListItemStyle?: ViewStyle;
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <ListItem
        leftElement={<SmallText style={UI_STYLES.flexShrink1}>{I18n.get(title)}</SmallText>}
        rightElement={<Checkbox checked={isChecked} onPress={onPress} customContainerStyle={customCheckboxContainerStyle} />}
        style={customListItemStyle}
      />
    </TouchableOpacity>
  );
};
