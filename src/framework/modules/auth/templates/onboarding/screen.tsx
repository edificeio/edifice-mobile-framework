import * as React from 'react';
import { Platform, View } from 'react-native';

import deviceInfoModule from 'react-native-device-info';
import Swiper from 'react-native-swiper';

import styles from './styles';
import { AuthOnboardingScreenPrivateProps, AuthOnboardingScreenState } from './types';

import { I18n } from '~/app/i18n';
import { getButtonWidth } from '~/framework/components/buttons/default';
import PrimaryButton from '~/framework/components/buttons/primary';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { PageView } from '~/framework/components/page';
import { HeadingLText, HeadingSText } from '~/framework/components/text';
import { authRouteNames } from '~/framework/modules/auth/navigation';
import { navigationDispatchMultiple } from '~/framework/modules/auth/navigation/main-account/router';
import appConf from '~/framework/util/appConf';
import { Image } from '~/framework/util/media';

class OnboardingScreen extends React.PureComponent<AuthOnboardingScreenPrivateProps, AuthOnboardingScreenState> {
  state = {
    buttonsWidth: 0,
  };

  showDiscoverLink = Platform.select(appConf.onboarding.showDiscoverLink);

  showDiscoveryClass = appConf.onboarding.showDiscoveryClass;

  showAppName = appConf.onboarding.showAppName;

  async componentDidMount() {
    // Calculate button(s) width(s)
    let discoverWidth = 0;
    const joinWidth = await getButtonWidth({ bold: true, text: I18n.get('user-onboarding-joinmynetwork'), type: 'primary' });
    if (this.showDiscoverLink)
      discoverWidth = await getButtonWidth({
        bold: true,
        icons: 1,
        text: I18n.get('user-onboarding-discover'),
        type: 'secondary',
      });
    if (this.showDiscoveryClass)
      discoverWidth = await getButtonWidth({
        bold: true,
        text: I18n.get('user-onboarding-discoveryclass'),
        type: 'secondary',
      });

    this.setState({ buttonsWidth: Math.max(joinWidth, discoverWidth) });
  }

  renderSecondaryButton = () => {
    const buttonStyles = [styles.discoverButton, { width: this.state.buttonsWidth }];
    if (this.showDiscoveryClass)
      return (
        <SecondaryButton
          text={I18n.get('user-onboarding-discoveryclass')}
          action={() => this.props.navigation.navigate(authRouteNames.discoveryClass, {})}
          style={buttonStyles}
          testID="onboarding-discoveryclass"
        />
      );
    if (this.showDiscoverLink)
      return (
        <SecondaryButton
          text={I18n.get('user-onboarding-discover')}
          url={I18n.get('user-onboarding-discoverlink')}
          requireSession={false}
          style={buttonStyles}
          testID="onboarding-discover"
        />
      );
    return null;
  };

  render() {
    const { navigation, nextScreenAction, pictures, texts } = this.props;
    const { buttonsWidth } = this.state;
    return (
      <PageView style={styles.page} statusBar="none">
        <View style={styles.mainContainer}>
          <HeadingLText style={styles.title} testID="onboarding-title">
            {this.showAppName ? deviceInfoModule.getApplicationName().toUpperCase() : null}
          </HeadingLText>
          <Swiper autoplay autoplayTimeout={5} dotStyle={styles.swiper} activeDotStyle={[styles.swiper, styles.swiperActive]}>
            {texts.map((onboardingText, index) => (
              <View key={index} style={styles.swiperItem}>
                <Image source={pictures[index]} style={styles.swiperItemImage} />
                <HeadingSText style={styles.swiperItemText}>{onboardingText}</HeadingSText>
              </View>
            ))}
          </Swiper>
        </View>
        <View style={styles.buttons}>
          <PrimaryButton
            text={I18n.get('user-onboarding-joinmynetwork')}
            action={() => {
              navigationDispatchMultiple(navigation, nextScreenAction);
            }}
            style={{ width: buttonsWidth }}
            testID="onboarding-join"
          />
          {/* Note: This button has to be hidden on iOs (only for ONE/NEO), since Apple doesn't approve
            when the url directs the user to external mechanisms for purchase and subscription to the app. */}
          {this.renderSecondaryButton()}
        </View>
      </PageView>
    );
  }
}

const OnboardingScreenConnected = OnboardingScreen;
export default OnboardingScreenConnected;
