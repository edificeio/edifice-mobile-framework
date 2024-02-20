import * as React from 'react';
import { Platform, View } from 'react-native';
import deviceInfoModule from 'react-native-device-info';
import Swiper from 'react-native-swiper';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import { getButtonWidth } from '~/framework/components/buttons/default';
import PrimaryButton from '~/framework/components/buttons/primary';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { PageView } from '~/framework/components/page';
import { HeadingLText, HeadingSText } from '~/framework/components/text';
import { authRouteNames, navigateAfterOnboarding } from '~/framework/modules/auth/navigation';
import appConf from '~/framework/util/appConf';
import { Image } from '~/framework/util/media';

import styles from './styles';
import { IOnboardingScreenProps, IOnboardingScreenState } from './types';

const renderOnboardingPics = {
  'onboarding-0': require('ASSETS/images/onboarding/onboarding_0.png'),
  'onboarding-1': require('ASSETS/images/onboarding/onboarding_1.png'),
  'onboarding-2': require('ASSETS/images/onboarding/onboarding_2.png'),
  'onboarding-3': require('ASSETS/images/onboarding/onboarding_3.png'),
};

class OnboardingScreen extends React.PureComponent<IOnboardingScreenProps, IOnboardingScreenState> {
  state = {
    buttonsWidth: 0,
  };

  showDiscoverLink = Platform.select(appConf.onboarding.showDiscoverLink);

  showDiscoveryClass = appConf.onboarding.showDiscoveryClass;

  showAppName = appConf.onboarding.showAppName;

  texts = I18n.getArray('user-onboarding-text');

  async componentDidMount() {
    // Calculate button(s) width(s)
    let discoverWidth = 0;
    const joinWidth = await getButtonWidth({ text: I18n.get('user-onboarding-joinmynetwork'), type: 'primary', bold: true });
    if (this.showDiscoverLink)
      discoverWidth = await getButtonWidth({
        text: I18n.get('user-onboarding-discover'),
        icons: 1,
        type: 'secondary',
        bold: true,
      });
    if (this.showDiscoveryClass)
      discoverWidth = await getButtonWidth({
        text: I18n.get('user-onboarding-discoveryclass'),
        type: 'secondary',
        bold: true,
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
  };

  render() {
    const { navigation } = this.props;
    const { buttonsWidth } = this.state;
    return (
      <PageView style={styles.page} statusBar="light">
        <View style={styles.mainContainer}>
          <HeadingLText style={styles.title} testID="onboarding-title">
            {this.showAppName ? deviceInfoModule.getApplicationName().toUpperCase() : null}
          </HeadingLText>
          <Swiper autoplay autoplayTimeout={5} dotStyle={styles.swiper} activeDotStyle={[styles.swiper, styles.swiperActive]}>
            {this.texts.map((onboardingText, index) => (
              <View key={index} style={styles.swiperItem}>
                <Image source={renderOnboardingPics[`onboarding-${index}`]} style={styles.swiperItemImage} />

                <HeadingSText style={styles.swiperItemText}>{onboardingText}</HeadingSText>
              </View>
            ))}
          </Swiper>
        </View>
        <View style={styles.buttons}>
          <PrimaryButton
            text={I18n.get('user-onboarding-joinmynetwork')}
            action={() => {
              navigateAfterOnboarding(navigation);
            }}
            style={{ width: buttonsWidth }}
            testID="onboarding-join"
          />
          {/* Note: The discover button has to be hidden on iOs (only for NEO), since Apple doesn't approve
            when the url directs the user to external mechanisms for purchase and subscription to the app. */}
          {this.renderSecondaryButton()}
        </View>
      </PageView>
    );
  }
}

const OnboardingScreenConnected = connect()(OnboardingScreen);
export default OnboardingScreenConnected;
