import I18n from 'i18n-js';
import * as React from 'react';
import { Linking, Platform, Text, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import { FakeHeader, HeaderAction, HeaderCenter, HeaderLeft, HeaderRow, HeaderTitle } from '~/framework/components/header';
import { InfoBubble } from '~/framework/components/infoBubble';
import { PageView } from '~/framework/components/page';
import NotificationTopInfo from '~/framework/modules/timelinev2/components/NotificationTopInfo';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import { FlatButton } from '~/ui';
import { openUrl } from '~/framework/util/linking';

// TYPES ==========================================================================================

export interface ITimelineWebViewScreenDataProps {}
export interface ITimelineWebViewScreenEventProps {}
export interface ITimelineWebViewScreenNavParams {
  notification: ITimelineNotification & IResourceUriNotification;
}
export type ITimelineWebViewScreenProps = ITimelineWebViewScreenDataProps &
  ITimelineWebViewScreenEventProps &
  NavigationInjectedProps<Partial<ITimelineWebViewScreenNavParams>>;

export interface ITimelineWebViewScreenState {}

// COMPONENT ======================================================================================

export class TimelineWebViewScreen extends React.PureComponent<ITimelineWebViewScreenProps, ITimelineWebViewScreenState> {
  // DECLARATIONS =================================================================================

  // RENDER =======================================================================================
  render() {
    return (
      <>
        {this.renderHeader()}
        <PageView>{this.renderRedirection()}</PageView>
      </>
    );
  }

  renderHeader() {
    const { navigation } = this.props;
    return (
      <FakeHeader>
        <HeaderRow>
          <HeaderLeft>
            <HeaderAction
              iconName={Platform.OS === 'ios' ? 'chevron-left1' : 'back'}
              iconSize={24}
              onPress={() => navigation.goBack()}
            />
          </HeaderLeft>
          <HeaderCenter>
            <HeaderTitle>{I18n.t('timeline.webViewScreen.title')}</HeaderTitle>
          </HeaderCenter>
        </HeaderRow>
      </FakeHeader>
    );
  }

  renderError() {
    return <Text>Error</Text>; // ToDo: great error screen here
  }

  renderRedirection() {
    const notification = this.props.navigation.getParam('notification');
    if (!notification) return this.renderError();
    return (
      <View style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: theme.color.background.card }}>
        <InfoBubble
          infoText={I18n.t('timeline.webViewScreen.infoBubbleText')}
          infoBubbleType="regular"
          infoBubbleId="webViewScreen.redirect"
          style={{ marginBottom: 20 }}
        />
        <NotificationTopInfo notification={notification} />
        <View style={{ marginVertical: 10 }}>
          <FlatButton
            title={I18n.t('common.openInBrowser')}
            customButtonStyle={{ backgroundColor: theme.color.neutral.extraLight }}
            customTextStyle={{ color: theme.color.secondary.regular }}
            onPress={() => {
              //TODO: create generic function inside oauth (use in myapps, etc.)
              if (!DEPRECATED_getCurrentPlatform()) {
                console.warn('Must have a platform selected to redirect the user');
                return null;
              }
              const url = `${DEPRECATED_getCurrentPlatform()!.url}${notification?.resource.uri}`;
              openUrl(url);
            }}
          />
        </View>
      </View>
    );
  }

  // LIFECYCLE ====================================================================================

  // METHODS ======================================================================================
}

// UTILS ==========================================================================================

// MAPPING ========================================================================================

const TimelineWebViewScreen_Connected = connect(
  () => ({}),
  () => ({}),
)(TimelineWebViewScreen);
export default TimelineWebViewScreen_Connected;
