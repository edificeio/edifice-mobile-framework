import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { ListItem } from '~/framework/components/listItem';
import { PageView } from '~/framework/components/page';
import { openPDFReader } from '~/framework/components/pdf/pdf-reader';
import { Icon } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { Trackers } from '~/framework/util/tracker';

import styles from './styles';
import type { UserLegalNoticeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.legalNotice>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('directory-legalNoticeTitle'),
  }),
});

const LEGAL_ITEMS = ['userCharter', 'cgu', 'personalDataProtection', 'cookies'];

function UserLegalNoticeScreen(props: UserLegalNoticeScreenPrivateProps) {
  const openLegalItem = React.useCallback(
    (legalItem: string) => {
      if (!props.urls) return; // ToDo error popup here
      const selectedLegalTitle = I18n.get(`user.legalNoticeScreen.${legalItem}`);
      const selectedLegalUrl = props.urls[legalItem];
      Trackers.trackEvent('Profile', 'READ NOTICE', legalItem);
      openPDFReader({ title: selectedLegalTitle, src: selectedLegalUrl });
    },
    [props.urls],
  );

  const renderLegalItem = React.useCallback(
    (legalItem: string) => (
      <TouchableOpacity onPress={() => openLegalItem(legalItem)} key={legalItem}>
        <ListItem
          leftElement={<SmallText>{I18n.get(`user.legalNoticeScreen.${legalItem}`)}</SmallText>}
          rightElement={<Icon name="arrow_down" color={theme.palette.primary.regular} style={styles.itemIcon} />}
        />
      </TouchableOpacity>
    ),
    [openLegalItem],
  );

  return <PageView>{LEGAL_ITEMS.map(legalItem => renderLegalItem(legalItem))}</PageView>;
}

export default connect((state: IGlobalState) => {
  return { urls: getAuthState(state).legalUrls };
})(UserLegalNoticeScreen);
