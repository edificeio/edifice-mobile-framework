import React, { useMemo } from 'react';
import { View } from 'react-native';

import styles from './styles';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import TextInput, { TextInputProps } from '~/framework/components/inputs/text';
import { ICON_INPUT_SIZE } from '~/framework/components/inputs/text/component';
import { Svg } from '~/framework/components/picture';

const SearchInput = (props: TextInputProps) => {
  const paddingLeft = useMemo(() => 2 * UI_SIZES.spacing.small + ICON_INPUT_SIZE, []);

  return (
    <View style={styles.container}>
      <Svg name="ui-search" fill={theme.palette.grey.black} width={ICON_INPUT_SIZE} height={ICON_INPUT_SIZE} style={styles.icon} />
      <TextInput
        {...props}
        placeholder={I18n.get('common-search')}
        style={{
          paddingLeft,
        }}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
    </View>
  );
};

export default SearchInput;
