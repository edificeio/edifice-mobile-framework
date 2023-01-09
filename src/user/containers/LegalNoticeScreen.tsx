import I18n from 'i18n-js';
import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/icon';
import { ListItem } from '~/framework/components/listItem';
import { PageView } from '~/framework/components/page';
import { SmallText } from '~/framework/components/text';
import { BackdropPdfReaderScreen } from '~/framework/screens/PdfReaderScreen';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';

import { IUserAuthState } from '../reducers/auth';
import { getAuthState } from '../selectors';

// TYPES ==========================================================================================

export interface ILegalNoticeScreenDataProps {
  auth: IUserAuthState;
}

export type ILegalNoticeScreenProps = ILegalNoticeScreenDataProps & NavigationInjectedProps;

export interface ILegalNoticeScreenState {
  selectedLegalTitle: string;
  selectedLegalUrl: string;
  showLegalDoc: boolean;
}

// COMPONENT ======================================================================================
class LegalNoticeScreen extends React.PureComponent<ILegalNoticeScreenProps, ILegalNoticeScreenState> {
  // DECLARATIONS ===================================================================================

  state: ILegalNoticeScreenState = {
    selectedLegalTitle: '',
    selectedLegalUrl: '',
    showLegalDoc: false,
  };

  // RENDER =========================================================================================

  render() {
    const { navigation } = this.props;
    const { showLegalDoc, selectedLegalTitle, selectedLegalUrl } = this.state;
    const legalItems = ['userCharter', 'cgu', 'personalDataProtection', 'cookies'];
    return (
      <PageView
        navigation={navigation}
        navBarWithBack={{
          title: I18n.t('directory-legalNoticeTitle'),
        }}>
        {legalItems.map(legalItem => this.renderLegalItem(legalItem))}
        <BackdropPdfReaderScreen
          handleClose={() => this.setState({ showLegalDoc: false, selectedLegalTitle: '', selectedLegalUrl: '' })}
          handleOpen={() => this.setState({ showLegalDoc: true, selectedLegalTitle, selectedLegalUrl })}
          visible={showLegalDoc}
          title={selectedLegalTitle}
          uri={selectedLegalUrl}
        />
      </PageView>
    );
  }

  renderLegalItem(legalItem: string) {
    return (
      <TouchableOpacity onPress={() => this.openLegalItem(legalItem)} key={legalItem}>
        <ListItem
          leftElement={<SmallText>{I18n.t(`user.legalNoticeScreen.${legalItem}`)}</SmallText>}
          rightElement={
            <Icon
              name="arrow_down"
              color={theme.palette.primary.regular}
              style={{ flex: 0, marginLeft: UI_SIZES.spacing.medium, transform: [{ rotate: '270deg' }] }}
            />
          }
        />
      </TouchableOpacity>
    );
  }

  // LIFECYCLE ======================================================================================

  // METHODS ========================================================================================

  openLegalItem = (legalItem: string) => {
    const { auth } = this.props;
    const legalUrls = auth.legalUrls;
    const selectedLegalTitle = I18n.t(`user.legalNoticeScreen.${legalItem}`);
    const selectedLegalUrl = legalUrls[legalItem];
    this.setState({ showLegalDoc: true, selectedLegalTitle, selectedLegalUrl });
    Trackers.trackEvent('Profile', 'READ NOTICE', legalItem);
  };

  // UTILS ==========================================================================================

  // MAPPING ========================================================================================
}

const ConnectedLegalNoticeScreen = connect((state: any): ILegalNoticeScreenDataProps => {
  return {
    auth: getAuthState(state),
  };
})(LegalNoticeScreen);

export default withViewTracking('user/legalNotice')(ConnectedLegalNoticeScreen);
