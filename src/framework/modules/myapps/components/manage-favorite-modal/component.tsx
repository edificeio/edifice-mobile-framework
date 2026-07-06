import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { I18n } from '~/app/i18n';
import { modalScreenOptions } from '~/app/navigation/util';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import SearchBar from '~/framework/components/search-bar';
import { SearchBarHandle } from '~/framework/components/search-bar/types';
import { MyAppsList } from '~/framework/modules/myapps/components/my-apps-list';
import { EMPTY_SCREEN_CONFIG } from '~/framework/modules/myapps/screens/utils';

import { styles } from './styles';
import { HeaderLeftProps, HeaderRightProps, ManageFavoriteScreenProps } from './types';
import { useManageFavoritesController } from './useController';

const HeaderLeft = ({ isSaving, onClose }: HeaderLeftProps) => (
  <NavBarAction color={theme.palette.grey.black} icon="ui-close" disabled={isSaving} onPress={onClose} />
);

const HeaderRight = ({ hasUnsavedChanges, isSaving, onValidate }: HeaderRightProps) => (
  <NavBarActionsGroup
    elements={[
      isSaving ? (
        <ActivityIndicator size={UI_SIZES.elements.navbarIconSize} color={theme.palette.grey.black} />
      ) : (
        <NavBarAction disabled={!hasUnsavedChanges} color={theme.palette.grey.black} icon="ui-check" onPress={onValidate} />
      ),
    ]}
  />
);

export const computeNavBar = modalScreenOptions('modal', () => ({
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: theme.ui.background.card.toString(),
  },
  headerTintColor: theme.ui.text.regular.toString(),
  headerTitle: '',
  statusBarStyle: 'dark',
}));
export const ManageFavoritesModalScreen = ({ navigation }: ManageFavoriteScreenProps.AllProps) => {
  const searchRef = React.useRef<SearchBarHandle>(null);
  const [searchFocused, setSearchFocused] = React.useState<boolean>(false);

  const { displayApps, handleGoBack, hasUnsavedChanges, isSaving, onToggle, onValidate, query, setQuery } =
    useManageFavoritesController(navigation);

  const renderHeaderLeft = React.useCallback(
    () => <HeaderLeft isSaving={isSaving} onClose={handleGoBack} />,
    [isSaving, handleGoBack],
  );

  const renderHeaderRight = React.useCallback(
    () => <HeaderRight isSaving={isSaving} hasUnsavedChanges={hasUnsavedChanges} onValidate={onValidate} />,
    [isSaving, hasUnsavedChanges, onValidate],
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: renderHeaderLeft,
      headerRight: renderHeaderRight,
    });
  }, [navigation, isSaving, hasUnsavedChanges, onValidate, handleGoBack, renderHeaderLeft, renderHeaderRight]);

  return (
    <>
      <View style={styles.searchContainer}>
        <SearchBar
          ref={searchRef}
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
        <MyAppsList
          apps={displayApps}
          emptyScreenConfig={EMPTY_SCREEN_CONFIG.search}
          isAllAppsFilter
          onPressApp={app => onToggle(app.name)}
        />
      </View>
    </>
  );
};

export default ManageFavoritesModalScreen;
