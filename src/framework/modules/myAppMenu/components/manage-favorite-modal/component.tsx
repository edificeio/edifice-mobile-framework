import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { styles } from './styles';
import { ManageFavoriteScreenProps } from './types';
import { useManageFavoritesController } from './useController';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import SearchBar from '~/framework/components/search-bar';
import { MyAppsList } from '~/framework/modules/myAppMenu/components/my-apps-list';
import { EMPTY_SCREEN_CONFIG } from '~/framework/modules/myAppMenu/screens/utils.ts';
import { navBarOptions } from '~/framework/navigation/navBar';

const headerTitleStyle = {
  color: theme.palette.grey.darkness,
};
export const computeNavBar: ManageFavoriteScreenProps.NavBarConfig = ({ navigation, route }) => ({
  presentation: 'modal',
  ...navBarOptions({
    navigation,
    route,
    // title: I18n.get('import-title'),
  }),
  headerStyle: {
    backgroundColor: theme.ui.background.page as string,
    borderBottomWidth: 0,
    elevation: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    shadowOpacity: 0,
    top: 0,
    zIndex: 100,
  },
  ...headerTitleStyle,
});
export const ManageFavoritesModalScreen = ({ navigation }: ManageFavoriteScreenProps.AllProps) => {
  const { displayApps, handleGoBack, hasUnsavedChanges, isSaving, onToggle, onValidate, query, setQuery } =
    useManageFavoritesController(navigation);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <NavBarAction color={theme.palette.grey.black} icon="ui-close" disabled={isSaving} onPress={handleGoBack} />
      ),
      headerRight: () => (
        <NavBarActionsGroup
          elements={[
            isSaving ? (
              <ActivityIndicator size={UI_SIZES.elements.navbarIconSize} color={theme.palette.grey.black} />
            ) : (
              <NavBarAction disabled={!hasUnsavedChanges} color={theme.palette.grey.black} icon="ui-check" onPress={onValidate} />
            ),
          ]}
        />
      ),
    });
  }, [navigation, onValidate, isSaving, handleGoBack, hasUnsavedChanges]);

  return (
    <PageView>
      <View style={styles.searchContainer}>
        <SearchBar
          containerStyle={styles.search}
          query={query}
          placeholder={I18n.get('common-search')}
          onChangeQuery={setQuery}
          onClear={() => setQuery('')}
        />
      </View>

      <View style={styles.listContainer}>
        <MyAppsList
          apps={displayApps}
          emptyScreenConfig={EMPTY_SCREEN_CONFIG.search}
          isFavoritesFilter
          onPressApp={app => onToggle(app.name)}
        />
      </View>
    </PageView>
  );
};

export default ManageFavoritesModalScreen;
