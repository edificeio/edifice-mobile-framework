import { connect } from 'react-redux';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { openUrl } from '~/framework/util/linking';
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
      return openUrl(fedeUrl, undefined, false, true, false);
    },
  };
};

const ConnectedFederatedAccountPage = connect(() => ({}), mapDispatchToProps)(FederatedAccountPage);

export default withViewTracking('auth/federated')(ConnectedFederatedAccountPage);
