import * as React from 'react';
import { Platform, View } from 'react-native';
import deviceInfoModule from 'react-native-device-info';
import Swiper from 'react-native-swiper';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import { getButtonWidth } from '~/framework/components/buttons/default';
import PrimaryButton from '~/framework/components/buttons/primary';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { NamedSVG, addToCache, removeFromCache } from '~/framework/components/picture/NamedSVG';
import { HeadingLText, HeadingSText } from '~/framework/components/text';
import { navigateAfterOnboarding } from '~/framework/modules/auth/navigation';
import appConf from '~/framework/util/appConf';

import styles from './styles';
import { IOnboardingScreenProps, IOnboardingScreenState } from './types';

class OnboardingScreen extends React.PureComponent<IOnboardingScreenProps, IOnboardingScreenState> {
  state = {
    buttonsWidth: 0,
    loading: true,
  };

  showDiscoverLink = Platform.select(appConf.onboarding.showDiscoverLink);

  showAppName = appConf.onboarding.showAppName;

  texts = I18n.getArray('user-onboarding-text');

  async componentDidMount() {
    // Calculate button(s) width(s)
    let discoverWidth = 0;
    const joinWidth = await getButtonWidth({ text: I18n.get('user-onboarding-joinmynetwork'), type: 'primary' });
    if (this.showDiscoverLink)
      discoverWidth = await getButtonWidth({
        text: I18n.get('user-onboarding-discover'),
        icons: 1,
        type: 'secondary',
      });
    // Preload onboarding images
    let cached = 0;
    const toCache = this.texts.length;
    this.texts.map(async (_onboardingText, index) => {
      addToCache(`onboarding-${index}`).then(() => {
        cached++;
        // All onboarding images have been cached => View can display onboarding
        if (cached === toCache) this.setState({ buttonsWidth: Math.max(joinWidth, discoverWidth), loading: false });
      });
    });
  }

  componentWillUnmount() {
    // Remove onboarding images from cache
    this.texts.map((_onboardingText, index) => {
      removeFromCache(`onboarding-${index}`);
    });
  }

  render() {
    const { navigation } = this.props;
    const { buttonsWidth, loading } = this.state;
    if (loading) return <LoadingIndicator />;
    return (
      <PageView style={styles.page} statusBar="light">
        <View style={styles.mainContainer}>
          <HeadingLText style={styles.title} testID="onboarding-title">
            {this.showAppName ? deviceInfoModule.getApplicationName().toUpperCase() : null}
          </HeadingLText>
          <Swiper autoplay autoplayTimeout={5} dotStyle={styles.swiper} activeDotStyle={[styles.swiper, styles.swiperActive]}>
            {this.texts.map((onboardingText, index) => (
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
