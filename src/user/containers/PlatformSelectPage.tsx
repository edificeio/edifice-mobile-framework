// Libraries
import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, StatusBar, View } from 'react-native';
import { connect } from 'react-redux';

import theme from '~/app/theme';
import GridList from '~/framework/components/GridList';
import { TouchableSelectorPictureCard } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { HeadingSText, SmallText } from '~/framework/components/text';
import appConf from '~/framework/util/appConf';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
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

export class PlatformSelectPage extends React.PureComponent<IPlatformSelectPageProps, object> {
  public render() {
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
                picture={
                  item.logoType === 'Image' ? { type: 'Image', source: item.logo } : { type: item.logoType, name: item.logo }
                }
                pictureStyle={{ height: 64, width: '100%' }}
                text={item.displayName}
                onPress={() => this.handleSelectPlatform(item.name)}
              />
            )}
            keyExtractor={item => item.url}
            ListHeaderComponent={
              <>
                <HeadingSText
                  style={{
                    marginBottom: UI_SIZES.spacing.big,
                    marginTop: UI_SIZES.spacing.medium + UI_SIZES.screen.topInset,
                    textAlign: 'center',
                  }}>
                  {I18n.t('welcome')}
                </HeadingSText>
                <SmallText style={{ color: theme.ui.text.light, textAlign: 'center', marginBottom: UI_SIZES.spacing.small }}>
                  {I18n.t('select-platform')}
                </SmallText>
              </>
            }
            alwaysBounceVertical={false}
            overScrollMode="never"
            ListFooterComponent={<View style={{ paddingBottom: UI_SIZES.screen.bottomInset }} />}
            gap={UI_SIZES.spacing.big}
            gapOutside={UI_SIZES.spacing.big}
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
