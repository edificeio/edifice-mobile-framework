import { Linking } from 'react-native';
import { connect } from 'react-redux';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { FederatedAccountPage, IFederatedAccountPageEventProps } from '~/user/components/FederatedAccount';

const mapDispatchToProps: (dispatch) => IFederatedAccountPageEventProps = dispatch => {
  const currentPf = DEPRECATED_getCurrentPlatform();
  const fedeUrl =
    typeof currentPf!.federation === 'string' ? currentPf!.federation : currentPf?.url + '/userbook/mon-compte#/edit-me';
  return {
    dispatch,
    onLink() {
      Trackers.trackEvent('Auth', 'GO TO', 'OTP Generation');
      return Linking.openURL(fedeUrl);
    },
  };
};

const ConnectedFederatedAccountPage = connect(() => ({}), mapDispatchToProps)(FederatedAccountPage);

export default withViewTracking('auth/federated')(ConnectedFederatedAccountPage);
