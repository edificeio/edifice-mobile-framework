import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { NavigationInjectedProps } from 'react-navigation';

import theme from '~/app/theme';
import GridList from '~/framework/components/GridList';
import { TouchableSelectorPictureCard } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { InfoBubble } from '~/framework/components/infoBubble';
import { PageView } from '~/framework/components/page';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { openUrl } from '~/framework/util/linking';
import { AnyModule } from '~/framework/util/moduleTool';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { IAppModule } from '~/infra/moduleTool/types';
import { FlatButton } from '~/ui/FlatButton';

class MyAppGrid extends React.PureComponent<NavigationInjectedProps, object> {
  private renderGrid(modules: IAppModule[], newModules?: AnyModule[]) {
    const allModules = [...modules, ...(newModules || [])]?.sort((a, b) =>
      I18n.t(a.config.displayName).localeCompare(I18n.t(b.config.displayName)),
    ) as (IAppModule | AnyModule)[];

    const renderGridItem = ({ item }: { item: IAppModule | AnyModule }) => (
      <TouchableSelectorPictureCard
        onPress={() => this.props.navigation.navigate(item.config.name)}
        text={I18n.t(item.config.displayName)}
        picture={
          item.config['picture']
            ? { ...item.config['picture'], height: 56, width: '100%' }
            : {
                type: 'Icon',
                color: item.config.iconColor,
                name: item.config.iconName,
                size: 56,
              }
        }
      />
    );

    return (
      <GridList
        data={allModules}
        renderItem={renderGridItem}
        keyExtractor={item => item.config.name}
        gap={UI_SIZES.spacing.extraLarge}
        gapOutside={UI_SIZES.spacing.extraLarge}
        ListFooterComponent={this.renderFooter()}
        ListFooterComponentStyle={{ flexGrow: 1, justifyContent: 'flex-end', marginVertical: UI_SIZES.spacing.extraLarge }}
        alwaysBounceVertical={false}
        overScrollMode="never"
        contentContainerStyle={{ flexGrow: 1 }}
      />
    );
  }

  private renderFooter() {
    return (
      <View style={{ height: Platform.OS === 'android' ? 40 : undefined }}>
        <FlatButton
          title={I18n.t('myapp-accessWeb')}
          loading={false}
          customButtonStyle={{ backgroundColor: undefined, borderColor: theme.color.secondary.regular, borderWidth: 1.5 }}
          customTextStyle={{ color: theme.color.secondary.regular }}
          onPress={() => {
            if (!DEPRECATED_getCurrentPlatform()) {
              return null;
            }
            const url = `${DEPRECATED_getCurrentPlatform()!.url}/welcome`;
            openUrl(url);
          }}
        />
        <InfoBubble
          infoText={I18n.t('myapp-infoBubbleText', { appName: DeviceInfo.getApplicationName() })}
          infoTitle={I18n.t('myapp-infoBubbleTitle')}
          infoImage={require('ASSETS/images/my-apps-infobubble.png')}
          infoBubbleType="floating"
          infoBubbleId="myAppsScreen.redirect"
        />
      </View>
    );
  }

  public render() {
    const { modules, newModules } = this.props;
    return (
      <PageView
        navigation={this.props.navigation}
        navBar={{
          title: I18n.t('MyApplications'),
        }}>
        {this.renderGrid(modules, newModules)}
      </PageView>
    );
  }
}

export default withViewTracking('myapps')(MyAppGrid);
