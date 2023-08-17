// Libraries
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import GridList from '~/framework/components/GridList';
import { TouchableSelectorPictureCard } from '~/framework/components/card/pictureCard';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import { HeadingSText, SmallText } from '~/framework/components/text';
import { IAuthNavigationParams, authRouteNames, getLoginRouteName } from '~/framework/modules/auth/navigation';
import appConf from '~/framework/util/appConf';

// Props definition -------------------------------------------------------------------------------

interface IPlatformSelectPageDataProps {
  // No props.
}

export type IPlatformSelectScreenProps = IPlatformSelectPageDataProps &
  NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.platforms>;

// State definition -------------------------------------------------------------------------------

// No state

// Styles -----------------------------------------------------------------------------------------

const styles = StyleSheet.create({
  heading: {
    marginTop: UI_SIZES.spacing.medium + UI_SIZES.screen.topInset,
    marginBottom: UI_SIZES.spacing.big,
    textAlign: 'center',
    color: theme.ui.text.regular,
  },
  lightP: { color: theme.ui.text.light, textAlign: 'center', marginBottom: UI_SIZES.spacing.small },
  picture: { height: 64, width: '100%' },
});

// Main component ---------------------------------------------------------------------------------

export class PlatformSelectScreen extends React.PureComponent<IPlatformSelectScreenProps, object> {
  public render() {
    const { navigation } = this.props;

    return (
      <PageView statusBar="light">
        <GridList
          data={appConf.platforms}
          renderItem={({ item }) => (
            <TouchableSelectorPictureCard
              picture={item.logoType === 'Image' ? { type: 'Image', source: item.logo } : { type: item.logoType, name: item.logo }}
              pictureStyle={styles.picture}
              text={item.displayName}
              onPress={() => {
                navigation.navigate(getLoginRouteName(item), { platform: item });
              }}
              {...(item.testID ? { testID: item.testID } : {})}
            />
          )}
          keyExtractor={item => item.url}
          ListHeaderComponent={
            <>
              <HeadingSText style={styles.heading} testID="network-welcome-title">
                {I18n.get('auth-platformselect-welcome')}
              </HeadingSText>
              <SmallText style={styles.lightP} testID="network-welcome-subtitle">
                {I18n.get('auth-platformselect-select')}
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
    );
  }

  // Event handlers
}

export default connect(
  (state: any, props: any) => ({}),
  dispatch => ({}),
)(PlatformSelectScreen);
