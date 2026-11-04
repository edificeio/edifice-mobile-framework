/**
 * Menu of « Mes applis » (button « ⋯ » of the header): manage the favorites, reorder them (filter « favorites », 2 favorites or more),
 * open the portal in the browser, show all the apps or only the modules. Without the last two (and the info) on the filter
 * « favorites », as the old screen did.
 */
import * as React from 'react';
import { ActivityIndicator } from 'react-native';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';

import { defineModal } from '~/app/navigation-new';
import Toast from '~/framework/components/toast';
import { Toggle } from '~/framework/components/toggle';
import { openUrlAsync } from '~/framework/util/linking';
import { MyAppsMenuItem } from '~/modules/myapps/components/my-apps-menu-item/component';
import { useFilteredApps, useShowAllApps } from '~/modules/myapps/hooks';
import type { MyAppsFilter } from '~/modules/myapps/model';
import { I18n } from '~/util/i18n';

import { MenuIcon, Separator, Sheet, sheetOptions, sheetStyles } from './sheet';

/** The portal, opened in the browser. */
const PORTAL_PATH = '/welcome';

const FAVORITES_FILTER: MyAppsFilter = { type: 'favorites' };
const MIN_FAVORITES_TO_REORDER = 2;

type MyAppsMenuParams = {
  /** The list shows the favorites: the switch « show all the apps » changes nothing there. */
  isFavoritesFilter: boolean;
};

function MyAppsMenuScreen({ route }: StaticScreenProps<MyAppsMenuParams>) {
  const navigation = useNavigation();
  const [showAllApps, setShowAllApps] = useShowAllApps();
  const [opening, setOpening] = React.useState(false);
  const favoriteApps = useFilteredApps(FAVORITES_FILTER);
  const canReorderFavorites = route.params.isFavoritesFilter && favoriteApps.length >= MIN_FAVORITES_TO_REORDER;

  // The sheet is closed, then the modal opened: no delay needed (§4 n° 7)
  const manageFavorites = React.useCallback(() => {
    navigation.goBack();
    navigation.navigate('myapps/favorites');
  }, [navigation]);

  const reorderFavorites = React.useCallback(() => {
    navigation.goBack();
    navigation.navigate('myapps/favorites-reorder');
  }, [navigation]);

  const openPortal = React.useCallback(async () => {
    try {
      setOpening(true);
      await openUrlAsync(PORTAL_PATH);
    } catch {
      Toast.showError(I18n.get('toast-error-text'));
    } finally {
      setOpening(false);
      navigation.goBack();
    }
  }, [navigation]);

  return (
    <Sheet>
      <MyAppsMenuItem
        onPress={manageFavorites}
        leftElement={<MenuIcon name="ui-star-outline" />}
        label={I18n.get('myapp-bottomsheet-handle-favorites')}
        testID="myapps-menu-manage-favorites"
      />
      {canReorderFavorites && (
        <MyAppsMenuItem
          onPress={reorderFavorites}
          leftElement={<MenuIcon name="ui-listOrder" />}
          label={I18n.get('myapp-bottomsheet-reorder-favorites')}
          testID="myapps-menu-reorder-favorites"
        />
      )}
      {!route.params.isFavoritesFilter && (
        <>
          <Separator />
          <MyAppsMenuItem
            leftElement={opening ? <ActivityIndicator size="small" /> : <MenuIcon name="ui-external-link" />}
            label={I18n.get('myapp-bottomsheet-access-by-browser')}
            onPress={openPortal}
            disabled={opening}
            testID="myapps-menu-access-by-browser"
          />
          <Separator />
          <MyAppsMenuItem
            isPressable={false}
            leftElement={
              <Toggle
                checked={showAllApps}
                onChange={() => setShowAllApps(!showAllApps)}
                testID={showAllApps ? 'myapps-all-showed' : 'myapps-all-hidden'}
              />
            }
            label={I18n.get('myapp-bottomsheet-render-all-favorites')}
          />
          <MyAppsMenuItem
            containerStyle={sheetStyles.infoMessageItem}
            isPressable={false}
            leftElement={<MenuIcon name="ui-infoCircle" />}
            label={I18n.get('myapp-bottomsheet-info-message')}
          />
        </>
      )}
    </Sheet>
  );
}

export default defineModal({
  options: sheetOptions,
  screen: MyAppsMenuScreen,
});
