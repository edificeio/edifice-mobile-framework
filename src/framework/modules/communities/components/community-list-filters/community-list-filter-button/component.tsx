import * as React from 'react';
import { View } from 'react-native';

import styles from './styles';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { Badge } from '~/framework/components/badge';
import DefaultButton from '~/framework/components/buttons/default';
import { BodyText } from '~/framework/components/text';

interface CommunityListFilterButtonProps {
  numberActiveFilters?: number;
}

const CommunityListFilterButton: React.FC<CommunityListFilterButtonProps> = ({ numberActiveFilters }) => {
  return (
    <View style={styles.container}>
      <DefaultButton
        text={I18n.get('communities-filter')}
        TextComponent={BodyText}
        contentColor={theme.palette.grey.black}
        iconLeft="ui-filter"
        iconRight={numberActiveFilters === undefined ? 'ui-rafterDown' : undefined}
      />
      {numberActiveFilters !== undefined && (
        <View style={styles.badge}>
          <Badge content={numberActiveFilters} color={theme.palette.primary.regular} />
        </View>
      )}
    </View>
  );
};

export default CommunityListFilterButton;
