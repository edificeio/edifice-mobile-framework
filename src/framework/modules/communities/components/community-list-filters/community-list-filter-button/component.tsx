import * as React from 'react';
import { View } from 'react-native';

import styles from './styles';
import { CommunityListFilterButtonProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { Badge } from '~/framework/components/badge';
import DefaultButton from '~/framework/components/buttons/default';
import { BodyText } from '~/framework/components/text';

const CommunityListFilterButton = ({ activeFiltersCount, onPress }: Readonly<CommunityListFilterButtonProps>) => {
  return (
    <View style={styles.container}>
      <DefaultButton
        action={onPress}
        text={I18n.get('communities-filter')}
        TextComponent={BodyText}
        contentColor={theme.palette.grey.black}
        iconLeft="ui-filter"
        iconRight={activeFiltersCount === 0 ? 'ui-rafterDown' : undefined}
      />
      {activeFiltersCount > 0 && (
        <View style={styles.badge}>
          <Badge content={activeFiltersCount} color={theme.palette.primary.regular} />
        </View>
      )}
    </View>
  );
};

export default CommunityListFilterButton;
