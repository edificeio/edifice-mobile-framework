import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, View } from 'react-native';
import Rate, { AndroidMarket } from 'react-native-rate';
import { NavigationInjectedProps } from 'react-navigation';

import { ActionButton } from '~/framework/components/ActionButton';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';
import withViewTracking from '~/framework/util/tracker/withViewTracking';

class WhoAreWeScreen extends React.PureComponent<NavigationInjectedProps<object>> {
  render() {
    const { navigation } = this.props;
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
          <BodyText>{I18n.t('user.whoAreWeScreen.description')}</BodyText>
          <ActionButton
            style={{ marginTop: UI_SIZES.spacing.large }}
            text={I18n.t('user.whoAreWeScreen.reviewApp')}
            emoji="⭐️"
            action={() => {
              const options = {
                AppleAppID: '1450246545',
                GooglePackageName: 'com.ode.one',
                preferredAndroidMarket: AndroidMarket.Google,
                preferInApp: true,
                inAppDelay: 0,
              };
              Rate.rate(options, (success, error) => {
                if (error) {
                  Alert.alert(I18n.t('common.error.title'), I18n.t('common.error.text'));
                  console.error(`WhoAreWeScreen Rate.rate() error: ${error}`);
                }
              });
            }}
          />
        </View>
      </PageView>
    );
  }
}

export default withViewTracking('user/whoAreWe')(WhoAreWeScreen);
