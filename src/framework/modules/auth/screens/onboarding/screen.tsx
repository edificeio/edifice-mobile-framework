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
import { NamedSVG } from '~/framework/components/picture/NamedSVG';
import { HeadingLText, HeadingSText } from '~/framework/components/text';
import { navigateAfterOnboarding } from '~/framework/modules/auth/navigation';
import appConf from '~/framework/util/appConf';

import styles from './styles';
import { IOnboardingScreenProps, IOnboardingScreenState } from './types';

class OnboardingScreen extends React.PureComponent<IOnboardingScreenProps, IOnboardingScreenState> {
  state = {
    buttonsWidth: 0,
  };

  showDiscoverLink = Platform.select(appConf.onboarding.showDiscoverLink);

  showAppName = appConf.onboarding.showAppName;

  async componentDidMount() {
    let discoverWidth = 0;
    const joinWidth = await getButtonWidth({ text: I18n.get('user-onboarding-joinmynetwork'), type: 'primary' });
    if (this.showDiscoverLink)
      discoverWidth = await getButtonWidth({
        text: I18n.get('user-onboarding-discover'),
        icons: 1,
        type: 'secondary',
      });
    this.setState({ buttonsWidth: Math.max(joinWidth, discoverWidth) });
  }

  render() {
    const { navigation } = this.props;
    const { buttonsWidth } = this.state;
    const texts = I18n.getArray('user-onboarding-text');
    return (
      <PageView style={styles.page} statusBar="light">
        <View style={styles.mainContainer}>
          <HeadingLText style={styles.title} testID="onboarding-title">
            {this.showAppName ? deviceInfoModule.getApplicationName().toUpperCase() : null}
          </HeadingLText>
          <Swiper autoplay autoplayTimeout={5} dotStyle={styles.swiper} activeDotStyle={[styles.swiper, styles.swiperActive]}>
            {texts.map((onboardingText, index) => (
              <View key={index} style={styles.swiperItem}>
                <NamedSVG name={`onboarding-${index}`} style={styles.swiperItemImage} />
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
          {/* Note: This button has to be hidden on iOs (only for ONE/NEO), since Apple doesn't approve
            when the url directs the user to external mechanisms for purchase and subscription to the app. */}
          {this.showDiscoverLink ? (
            <SecondaryButton
              text={I18n.get('user-onboarding-discover')}
              url={I18n.get('user-onboarding-discoverlink')}
              requireSession={false}
              style={[styles.discoverButton, { width: buttonsWidth }]}
              testID="onboarding-discover"
            />
          ) : null}
        </View>
      </PageView>
    );
  }
}

const OnboardingScreenConnected = connect()(OnboardingScreen);
export default OnboardingScreenConnected;
