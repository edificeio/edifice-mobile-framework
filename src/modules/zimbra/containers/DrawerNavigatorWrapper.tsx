import I18n from 'i18n-js';
import React from 'react';
import { Platform, View } from 'react-native';
import { NavigationInjectedProps, NavigationState } from 'react-navigation';
import { createDrawerNavigator, NavigationDrawerScreenProps } from 'react-navigation-drawer';
import { connect } from 'react-redux';

import DrawerMenuContainer from './DrawerMenu';
import MailList from './MailList';
import { DraftType } from './NewMail';

import { ModalStorageWarning } from '~/modules/zimbra/components/Modals/QuotaModal';
import { getQuotaState, IQuota } from '~/modules/zimbra/state/quota';
import { Icon } from '~/ui';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';
import { DEPRECATED_HeaderPrimaryAction, HeaderAction, HeaderTitle } from '~/framework/components/header';
import { ButtonIcon } from '~/framework/components/popupMenu';
import { hasNotch } from 'react-native-device-info';
import { PageView } from '~/framework/components/page';

type DrawerNavigatorWrapperProps = {
  storage: IQuota;
} & NavigationInjectedProps &
  NavigationDrawerScreenProps;

type DrawerNavigatorWrapperState = {
  isShownStorageWarning: boolean;
};

const DrawerNavigatorComponent = createDrawerNavigator(
  {
    inbox: MailList,
    sendMessages: MailList,
    drafts: MailList,
    trash: MailList,
    spams: MailList,
    folder: MailList,
  },
  {
    contentComponent: DrawerMenuContainer,
    edgeWidth: -1,
  },
);

export const IconButton = ({ icon, color, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={{}}>
      <Icon size={16} color={color} name={icon} />
    </TouchableOpacity>
  );
};

export class DrawerNavigatorWrapper extends React.Component<DrawerNavigatorWrapperProps, DrawerNavigatorWrapperState> {
  static router = DrawerNavigatorComponent.router;

  constructor(props) {
    super(props);

    this.state = {
      isShownStorageWarning: false,
    };
  }

  isStorageFull = () => {
    const { storage } = this.props;
    if (Number(storage.quota) > 0 && storage.storage >= Number(storage.quota)) {
      this.setState({ isShownStorageWarning: true });
      return true;
    }
    return false;
  };

  getTitle = (activeRoute: any) => {
    const { key, params } = activeRoute;
    if (params !== undefined && params.folderName !== undefined) return params.folderName;
    switch (key) {
      case 'sendMessages':
        return I18n.t('zimbra-outbox');
      case 'drafts':
        return I18n.t('zimbra-drafts');
      case 'trash':
        return I18n.t('zimbra-trash');
      case 'spams':
        return I18n.t('zimbra-spams');
      default:
      case 'inbox':
        return I18n.t('zimbra-inbox');
    }
  };

  getActiveRouteState = (route: NavigationState) => {
    if (!route.routes || route.routes.length === 0 || route.index >= route.routes.length) {
      return route;
    }

    const childActiveRoute = route.routes[route.index] as NavigationState;
    return this.getActiveRouteState(childActiveRoute);
  };

  public render() {
    const { navigation } = this.props;
    const title = this.getTitle(this.getActiveRouteState(navigation.state));
    const params = this.getActiveRouteState(navigation.state).params;

    const navBarInfo =
      !params || !params.selectedMails
        ? {
            left: (
              <HeaderAction
                iconName="menu"
                onPress={() => {
                  navigation.toggleDrawer();
                }}
              />
            ),
            title: (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <HeaderTitle>{title}</HeaderTitle>
                <HeaderAction iconName="search2" iconSize={16} iconStyle={{width: 30, alignItems: 'flex-end'}} onPress={() => navigation.navigate('search')} />
              </View>
            ),
          }
        : undefined;
    const navBarBigButton = (!params || !params.selectedMails) && (
      <DEPRECATED_HeaderPrimaryAction
        iconName="new_message"
        onPress={() => {
          if (!this.isStorageFull() || this.state.isShownStorageWarning) {
            this.props.navigation.navigate('newMail', {
              type: DraftType.NEW,
              mailId: undefined,
              currentFolder: this.getActiveRouteState(navigation.state).key,
            });
          }
        }}
      />
    );

    return (
      <>
        <PageView navigation={this.props.navigation} navBar={navBarInfo} navBarNode={navBarBigButton}>
          <DrawerNavigatorComponent navigation={navigation} />
        </PageView>

        <ModalStorageWarning
          isVisible={this.state.isShownStorageWarning}
          closeModal={() => this.setState({ isShownStorageWarning: false })}
        />
      </>
    );
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {
    storage: getQuotaState(state).data,
  };
};

export default connect(mapStateToProps)(DrawerNavigatorWrapper);
