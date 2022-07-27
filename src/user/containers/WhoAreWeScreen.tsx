import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';

import { ActionButton } from '~/framework/components/ActionButton';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { Text, TextSizeStyle } from '~/framework/components/text';
import withViewTracking from '~/framework/util/tracker/withViewTracking';

class WhoAreWeScreen extends React.PureComponent<NavigationInjectedProps<object>> {
  render() {
    const { navigation } = this.props;
    const appReviewUrl = Platform.select({
      ios: 'https://apps.apple.com/fr/app/one-pocket/id1450246545',
      android: 'https://play.google.com/store/apps/details?id=com.ode.one',
    });
    return (
      <PageView navigation={navigation} navBarWithBack={{ title: I18n.t('directory-whoAreWeTitle') }}>
        <View style={{ aspectRatio: 3 }}>
          <Picture
            type="Image"
            source={require('ASSETS/images/who-are-we.png')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
        <View style={{ padding: UI_SIZES.spacing.big }}>
          <Text style={{ ...TextSizeStyle.SlightBig }}>{I18n.t('user.whoAreWeScreen.description')}</Text>
          <ActionButton
            style={{ marginTop: UI_SIZES.spacing.large }}
            text={I18n.t('user.whoAreWeScreen.reviewApp')}
            url={appReviewUrl}
            showIcon={false}
            showConfirmation={false}
          />
        </View>
      </PageView>
    );
  }
}

export default withViewTracking('user/whoAreWe')(WhoAreWeScreen);
