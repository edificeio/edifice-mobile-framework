/**
 * Actions on an app of « Mes applis » (long press on its card): add it to the favorites or remove it, open its help.
 */
import * as React from 'react';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';

import { defineModal } from '~/app/navigation-new';
import Toast from '~/framework/components/toast';
import { openUrl } from '~/framework/util/linking';
import { withSession } from '~/modules/auth/hoc';
import type { AuthActiveAccount } from '~/modules/auth/model';
import { MyAppsMenuItem } from '~/modules/myapps/components/my-apps-menu-item';
import { MenuIcon, Separator, Sheet, sheetOptions } from '~/modules/myapps/components/sheet';
import { useEntApp, useFavorites } from '~/modules/myapps/hooks';
import { getHelpUrl } from '~/modules/myapps/model/display';
import { I18n } from '~/util/i18n';

type MyAppsAppActionsParams = {
  /** `EntApp.name` of the app. */
  appName: string;
};

function MyAppsAppActionsScreen({ route, session }: StaticScreenProps<MyAppsAppActionsParams> & { session: AuthActiveAccount }) {
  const { appName } = route.params;
  const navigation = useNavigation();
  const app = useEntApp(appName);
  const { favorites, toggle } = useFavorites();
  const isFavorite = favorites.has(appName);
  const helpUrl = app && getHelpUrl(app.helpUrls, I18n.getLanguage());

  // The sheet closes, then the favorites are saved: the star of the card changes only once they are (§4 n° 6)
  const toggleFavorite = React.useCallback(async () => {
    navigation.goBack();
    try {
      await toggle(session, appName);
      Toast.showSuccess(I18n.get('myapp-add-favorite-success-message'));
    } catch (e) {
      console.error('[MyApps] Failed to save the favorites', e);
      Toast.showError(I18n.get('myapp-add-favorite-error-message'));
    }
  }, [appName, navigation, session, toggle]);

  const openHelp = React.useCallback(() => {
    navigation.goBack();
    if (helpUrl) openUrl(helpUrl);
  }, [helpUrl, navigation]);

  return (
    <Sheet>
      <MyAppsMenuItem
        label={I18n.get(isFavorite ? 'myapp-bottomsheet-withdraw-from-favorites' : 'myapp-bottomsheet-add-to-favorites')}
        leftElement={<MenuIcon name={isFavorite ? 'ui-star-filled' : 'ui-star-outline'} />}
        onPress={toggleFavorite}
        testID="myapps-toggle-favorite"
      />
      {helpUrl && (
        <>
          <Separator />
          <MyAppsMenuItem
            label={I18n.get('myapp-bottomsheet-app-info')}
            leftElement={<MenuIcon name="ui-infoCircle" />}
            onPress={openHelp}
            testID="myapps-app-info"
          />
        </>
      )}
    </Sheet>
  );
}

export default defineModal({
  options: sheetOptions,
  screen: withSession<StaticScreenProps<MyAppsAppActionsParams>>(MyAppsAppActionsScreen),
});
