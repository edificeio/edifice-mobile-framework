import I18n from 'i18n-js';
import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';

import theme from '~/app/theme';
import { BackdropPdfReader } from '~/framework/components/backdropPdfReader';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/icon';
import { ListItem } from '~/framework/components/listItem';
import { PageView } from '~/framework/components/page';
import { SmallText } from '~/framework/components/text';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';

// TYPES ==========================================================================================

export interface ILegalNoticeScreenState {
  legalTitle: string;
  legalUrl: string;
}

// COMPONENT ======================================================================================
class LegalNoticeScreen extends React.PureComponent<NavigationInjectedProps<object>, ILegalNoticeScreenState> {
  // DECLARATIONS ===================================================================================

  state: ILegalNoticeScreenState = {
    legalTitle: '',
    legalUrl: '',
  };

  // RENDER =========================================================================================

  render() {
    const { navigation } = this.props;
    const { legalTitle, legalUrl } = this.state;
    const legalItems = ['userCharter', 'cgu', 'personalDataProtection', 'cookies'];

    return (
      <PageView
        navigation={navigation}
        navBarWithBack={{
          title: I18n.t('directory-legalNoticeTitle'),
        }}>
        {legalItems.map(legalItem => this.renderLegalItem(legalItem))}
        <BackdropPdfReader
          handleClose={() => this.setState({ legalTitle: '', legalUrl: '' })}
          handleOpen={() => this.setState({ legalTitle, legalUrl })}
          title={legalTitle}
          uri={legalUrl}
          visible={!!legalUrl}
        />
      </PageView>
    );
  }

  renderLegalItem(legalItem: string) {
    return (
      <TouchableOpacity onPress={() => this.handleOpenLegalItem(legalItem)} key={legalItem}>
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

  handleOpenLegalItem = (legalItem: string) => {
    const platform = DEPRECATED_getCurrentPlatform()!.url;
    const path = I18n.t(`common.url.${legalItem}`);
    const legalUrl = `${platform}${path}`;
    const legalTitle = I18n.t(`user.legalNoticeScreen.${legalItem}`);
    this.setState({ legalUrl, legalTitle });
    Trackers.trackEvent('Profile', 'READ NOTICE', legalItem);
  };

  // UTILS ==========================================================================================

  // MAPPING ========================================================================================
}

export default withViewTracking('user/legalNotice')(LegalNoticeScreen);
