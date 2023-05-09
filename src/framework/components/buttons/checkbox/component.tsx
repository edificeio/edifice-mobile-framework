import I18n from 'i18n-js';
import * as React from 'react';

import theme from '~/app/theme';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_STYLES } from '~/framework/components/constants';
import { ListItem } from '~/framework/components/listItem';
import { SmallText } from '~/framework/components/text';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

import styles from './styles';

export const CheckboxButton = ({
  onPress,
  title,
  isChecked,
  isAllButton,
}: {
  onPress: () => any;
  title: string;
  isChecked: boolean;
  isAllButton?: boolean;
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <ListItem
        leftElement={<SmallText style={UI_STYLES.flexShrink1}>{I18n.t(title)}</SmallText>}
        rightElement={
          <Checkbox
            {...(isChecked && isAllButton ? { customCheckboxColor: theme.ui.text.light } : {})}
            {...(isAllButton ? { customContainerStyle: styles.allButton } : {})}
            checked={isChecked}
            onPress={onPress}
          />
        }
      />
    </TouchableOpacity>
  );
};
