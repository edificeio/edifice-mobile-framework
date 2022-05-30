// Libraries
import styled from '@emotion/native';
import I18n from 'i18n-js';
import * as React from 'react';
import { Image, Platform, StatusBar, View } from 'react-native';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import GridList from '~/framework/components/GridList';
import { TouchableSelectorPictureCard } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import appConf from '~/framework/util/appConf';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { CommonStyles } from '~/styles/common/styles';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';
import { H1, Light, LightP } from '~/ui/Typography';
import { selectPlatform } from '~/user/actions/platform';
import { IUserAuthState } from '~/user/reducers/auth';

// Props definition -------------------------------------------------------------------------------

export interface IPlatformSelectPageDataProps {
  auth: IUserAuthState;
  headerHeight: number;
}

export interface IPlatformSelectPageEventProps {
  onPlatformSelected: (platformId: string) => Promise<void>;
}

export interface IPlatformSelectPageOtherProps {
  navigation?: any;
}

export type IPlatformSelectPageProps = IPlatformSelectPageDataProps & IPlatformSelectPageEventProps & IPlatformSelectPageOtherProps;

// State definition -------------------------------------------------------------------------------

// No state

// Main component ---------------------------------------------------------------------------------

const PlatformButton = styled(TouchableOpacity)({
  elevation: 3,
  shadowColor: '#6B7C93',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 2,

  flexDirection: 'column',
  paddingHorizontal: 16,
  paddingVertical: 32,

  backgroundColor: '#FFFFFF',
});

export class PlatformSelectPage extends React.PureComponent<IPlatformSelectPageProps, object> {
  public render() {
    const pfComponents = [] as React.ReactElement[];
    for (const pf of appConf.platforms) {
      if (!pf.hidden) {
        pfComponents.push(
          <View
            key={pf.name}
            style={{
              flexBasis: '50%',
              padding: 12,
            }}>
            <PlatformButton
              onPress={() => this.handleSelectPlatform(pf.name)}
              style={{
                alignItems: 'center',
              }}>
              <Image resizeMode="contain" style={{ height: 40, width: '100%', marginBottom: 20 }} source={pf.logo} />
              <Light>{pf.displayName}</Light>
            </PlatformButton>
          </View>,
        );
      }
    }

    return (
      <>
        <PageView navigation={this.props.navigation}>
          {Platform.select({
            ios: <StatusBar barStyle="dark-content" />,
            android: <StatusBar backgroundColor={theme.ui.background.page} barStyle="dark-content" />,
          })}
          <GridList
            data={appConf.platforms}
            renderItem={({ item }) => (
              <TouchableSelectorPictureCard
                picture={{ type: 'Image', source: item.logo }}
                pictureStyle={{ height: 64 }}
                text={item.displayName}
                onPress={() => this.handleSelectPlatform(item.name)}
              />
            )}
            keyExtractor={item => item.url}
            ListHeaderComponent={
              <>
                <H1
                  style={{
                    color: CommonStyles.textColor,
                    fontSize: 20,
                    fontWeight: 'normal',
                    marginTop: 55,
                    textAlign: 'center',
                  }}>
                  {I18n.t('welcome')}
                </H1>
                <LightP style={{ textAlign: 'center', marginBottom: 12 }}>{I18n.t('select-platform')}</LightP>
              </>
            }
            alwaysBounceVertical={false}
            overScrollMode="never"
            ListFooterComponent={<View style={{ paddingBottom: UI_SIZES.screen.bottomInset }} />}
            gap={UI_SIZES.spacing.extraLarge}
            gapOutside={UI_SIZES.spacing.extraLarge}
          />
        </PageView>
      </>
    );
  }

  // Event handlers

  protected handleSelectPlatform(platformId: string) {
    this.props.onPlatformSelected(platformId);
  }
}

const ConnectedPlatformselectPage = connect(
  (state: any, props: any) => ({}),
  dispatch => ({
    onPlatformSelected: (platformId: string) => {
      dispatch(selectPlatform(platformId, true, true));
    },
  }),
)(PlatformSelectPage);

export default withViewTracking('auth/platforms')(ConnectedPlatformselectPage);
