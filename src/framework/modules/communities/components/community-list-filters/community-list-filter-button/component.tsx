import * as React from 'react';
import { View } from 'react-native';

import theme from '~/app/theme';
import { Badge } from '~/framework/components/badge';
import DefaultButton from '~/framework/components/buttons/default';
import { BodyText } from '~/framework/components/text';
import { I18n } from '~/util/i18n';

import styles from './styles';
import { CommunityListFilterButtonProps } from './types';

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
        testID={'filter-btn'}
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
