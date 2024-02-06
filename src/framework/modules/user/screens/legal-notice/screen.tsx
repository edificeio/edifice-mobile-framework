import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { connect, useDispatch } from 'react-redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { ListItem } from '~/framework/components/listItem';
import { PageView } from '~/framework/components/page';
import { openPDFReader } from '~/framework/components/pdf/pdf-reader';
import { Icon } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { getLegalUrlsAction } from '~/framework/modules/auth/actions';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import type { UserLegalNoticeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.legalNotice>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('user-legalnotice-title'),
  }),
});

const LEGAL_ITEMS = ['userCharter', 'cgu', 'personalDataProtection', 'cookies'];

function UserLegalNoticeScreen(props: UserLegalNoticeScreenPrivateProps) {
  const dispatch = useDispatch();

  // Try to update legal urls
  React.useEffect(() => {
    const fetchlegalUrls = async () => {
      if (props?.session?.platform) dispatch(getLegalUrlsAction(props?.session?.platform));
    };
    fetchlegalUrls().catch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openLegalItem = React.useCallback(
    (legalItem: string) => {
      if (!props.urls) return; // ToDo error popup here
      const selectedLegalTitle = I18n.get(`user-legalnotice-${legalItem.toLowerCase()}`);
      const selectedLegalUrl = props.urls[legalItem];
      openPDFReader({ title: selectedLegalTitle, src: selectedLegalUrl });
    },
    [props.urls],
  );

  const renderLegalItem = React.useCallback(
    (legalItem: string) => (
      <TouchableOpacity onPress={() => openLegalItem(legalItem)} key={legalItem}>
        <ListItem
          leftElement={<SmallText>{I18n.get(`user-legalnotice-${legalItem.toLowerCase()}`)}</SmallText>}
          rightElement={<Icon name="arrow_down" color={theme.palette.primary.regular} style={styles.itemIcon} />}
        />
      </TouchableOpacity>
    ),
    [openLegalItem],
  );

  return <PageView>{LEGAL_ITEMS.map(legalItem => renderLegalItem(legalItem))}</PageView>;
}

export default connect((state: IGlobalState) => {
  const authState = getAuthState(state);
  return { session: authState.session, urls: authState.legalUrls };
})(UserLegalNoticeScreen);
