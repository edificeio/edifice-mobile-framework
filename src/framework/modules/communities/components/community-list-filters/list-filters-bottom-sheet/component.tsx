import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { CommunityType } from '@edifice.io/community-client-rest-rn';

import { styles } from './styles';
import { ListFiltersBottomSheetProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { UI_SIZES } from '~/framework/components/constants';
import FiltersList from '~/framework/components/form/filters';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText } from '~/framework/components/text';
import { AVAILABLE_FILTERS } from '~/framework/modules/communities/screens/list/screen';

const communityTypeI18n = {
  [CommunityType.CLASS]: 'communities-filter-class',
  [CommunityType.FREE]: 'communities-filter-thematic',
};

const ListFiltersBottomSheet = React.forwardRef<BottomSheetModalMethods, ListFiltersBottomSheetProps>(
  ({ onValidate: _onValidate, selectedFilters }, ref) => {
    const [filtersData, setFiltersData] = React.useState(
      AVAILABLE_FILTERS.map(filter => ({
        id: filter,
        isActive: selectedFilters.includes(filter),
        name: I18n.get(communityTypeI18n[filter]),
      })),
    );

    const selectedFiltersCount = React.useMemo(() => {
      let count = 0;
      for (const element of filtersData) {
        if (element.isActive) {
          count++;
        }
      }
      return count;
    }, [filtersData]);

    const filtersListTitle = I18n.get('filter-list-header');

    // ToDo: use pluralization from i18next here
    const displayedSelectedFiltersCount = selectedFiltersCount > 0 ? ` (${selectedFiltersCount})` : '';
    const validateButtonText = `${I18n.get('filter-list-validate')}${displayedSelectedFiltersCount}`;

    const closeBottomSheet = React.useCallback(() => {
      (ref as React.RefObject<BottomSheetModalMethods>)?.current?.dismiss();
    }, [ref]);

    const onReset = React.useCallback(() => {
      _onValidate([]);
      setFiltersData(
        AVAILABLE_FILTERS.map(filter => ({
          id: filter,
          isActive: false,
          name: I18n.get(communityTypeI18n[filter]),
        })),
      );
      closeBottomSheet();
    }, [_onValidate, closeBottomSheet]);

    const onValidate = React.useCallback(() => {
      const activeFilterTypes = filtersData.filter(filter => filter.isActive).map(filter => filter.id);
      _onValidate(activeFilterTypes);
      closeBottomSheet();
    }, [_onValidate, closeBottomSheet, filtersData]);

    return (
      <BottomSheetModal ref={ref} style={styles.bottomSheetPaddingBottom}>
        <View style={styles.listHeader}>
          <TouchableOpacity onPress={closeBottomSheet} style={styles.closeButton}>
            <Svg
              name="ui-close"
              height={UI_SIZES.elements.icon.small}
              width={UI_SIZES.elements.icon.small}
              fill={theme.palette.grey.black}
            />
          </TouchableOpacity>
          <TertiaryButton
            action={onReset}
            disabled={selectedFiltersCount === 0}
            style={styles.resetButton}
            text={I18n.get('filter-list-reset')}
          />
        </View>
        <FiltersList options={filtersData} onChange={setFiltersData} title={filtersListTitle} />
        <PrimaryButton
          action={onValidate}
          disabled={selectedFiltersCount === 0}
          text={validateButtonText}
          TextComponent={SmallBoldText}
        />
      </BottomSheetModal>
    );
  },
);

export default ListFiltersBottomSheet;
