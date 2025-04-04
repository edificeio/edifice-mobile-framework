import React from 'react';
import { TouchableOpacity } from 'react-native';

import styles from './styles';
import { FilterButtonProps } from './types';

import theme from '~/app/theme';
import { NamedSVG } from '~/framework/components/picture';
import { SmallActionText } from '~/framework/components/text';

const FilterButton: React.FunctionComponent<FilterButtonProps> = ({ action, text }) => {
  return (
    <TouchableOpacity onPress={action} style={styles.mainContainer}>
      <SmallActionText>{text}</SmallActionText>
      <NamedSVG name="ui-rafterDown" width={16} height={16} fill={theme.palette.primary.regular} />
    </TouchableOpacity>
  );
};

export default FilterButton;
