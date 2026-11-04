/**
 * Manage the favorites of « Mes applis » at once (menu « ⋯ » → « Gérer les favoris »): search, select several apps, then validate.
 */
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';

import { defineModal, headerAction, headerCustom, headerRightActions } from '~/app/navigation-new';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import SearchBar from '~/framework/components/search-bar';
import { MyAppsList } from '~/modules/myapps/components/my-apps-list/component';
import { EMPTY_SCREEN_CONFIG } from '~/modules/myapps/components/my-apps-list/utils';
import type { ListedApp } from '~/modules/myapps/model';
import { I18n } from '~/util/i18n';

import { useFavoritesSelection, useSaveFavorites } from './hooks';
import { styles } from './styles';

/** While the selection is saved, instead of the button to validate it (the theme is read when called, not at import). */
const savingIndicator = () =>
  headerCustom(<ActivityIndicator size={UI_SIZES.elements.navbarIconSize} color={theme.palette.grey.black} />);

function MyAppsFavoritesScreen({}: StaticScreenProps<undefined>) {
  const navigation = useNavigation();
  const [searchFocused, setSearchFocused] = React.useState(false);
  const { apps, hasUnsavedChanges, query, selected, setQuery, toggle } = useFavoritesSelection();
  const { isSaving, validate } = useSaveFavorites(selected, hasUnsavedChanges);

  // The button depends on the selection, a state of the screen: set by the screen, as react-navigation advises for such buttons
  React.useLayoutEffect(() => {
    navigation.setOptions(
      headerRightActions(
        isSaving
          ? savingIndicator()
          : headerAction({
              disabled: !hasUnsavedChanges,
              icon: { android: 'ui-check', ios: { name: 'checkmark', type: 'sfSymbol' } },
              label: I18n.get('common-save'),
              onPress: validate,
              testID: 'myapps-favorites-validate',
            }),
      ),
    );
  }, [hasUnsavedChanges, isSaving, navigation, validate]);

  const onPressApp = React.useCallback((item: ListedApp) => toggle(item.app.name), [toggle]);

  return (
    <>
      <View style={styles.searchContainer}>
        <SearchBar
          clearButtonCustomColor={styles.clearButtonColor.color}
          containerStyle={[styles.search, !searchFocused && query.length === 0 ? styles.searchInactive : undefined]}
          query={query}
          placeholder={I18n.get('common-search')}
          onChangeQuery={setQuery}
          onClear={() => setQuery('')}
          onFocusChange={setSearchFocused}
        />
      </View>
      <View style={styles.listContainer}>
        <MyAppsList apps={apps} emptyScreenConfig={EMPTY_SCREEN_CONFIG.search} isAllAppsFilter onPressApp={onPressApp} />
      </View>
    </>
  );
}

export default defineModal({
  options: () => ({
    headerShadowVisible: false,
    headerStyle: { backgroundColor: theme.ui.background.card?.toString() },
    headerTintColor: theme.ui.text.regular?.toString(),
    headerTitle: '',
    statusBarStyle: 'dark',
  }),
  screen: MyAppsFavoritesScreen,
});
