import I18n from 'i18n-js';
import * as React from 'react';
// @ts-ignore’
import { View, ScrollView, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { NavigationInjectedProps } from 'react-navigation';

import MyAppItem from './MyAppItem';

import theme from '~/app/theme';
import { InfoBubble } from '~/framework/components/infoBubble';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { AnyModule } from '~/framework/util/moduleTool';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { IAppModule } from '~/infra/moduleTool/types';
import { EmptyScreen } from '~/ui/EmptyScreen';
import { FlatButton } from '~/ui/FlatButton';
import { openUrl } from '~/framework/util/linking';
import { PageView } from '~/framework/components/page';

class MyAppGrid extends React.PureComponent<NavigationInjectedProps, object> {
  renderModulesList = (modules: IAppModule[], newModules?: AnyModule[]) => {
    const allModules = [...modules, ...(newModules || [])]?.sort((a, b) =>
      I18n.t(a.config.displayName).localeCompare(I18n.t(b.config.displayName)),
    ) as (IAppModule | AnyModule)[];
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {allModules?.map(item => (
          <MyAppItem
            key={item.config.name}
            displayName={I18n.t(item.config.displayName)}
            iconColor={item.config.iconColor}
            iconName={item.config.iconName}
            onPress={() => this.props.navigation.navigate(item.config.name)}
          />
        ))}
      </View>
    );
  };

  private renderGrid(modules: IAppModule[], newModules?: AnyModule[]) {
    return (
      <ScrollView contentContainerStyle={{ justifyContent: 'space-between', flexGrow: 1 }}>
        {this.renderModulesList(modules, newModules)}
        <View style={{ justifyContent: 'center', height: 80 }}>
          <View style={{ height: Platform.OS === 'android' ? 40 : undefined }}>
            <FlatButton
              title={I18n.t('myapp-accessWeb')}
              loading={false}
              customButtonStyle={{ backgroundColor: undefined, borderColor: theme.color.secondary.regular, borderWidth: 1.5 }}
              customTextStyle={{ color: theme.color.secondary.regular }}
              onPress={() => {
                if (!DEPRECATED_getCurrentPlatform()) {
                  console.warn('Must have a platform selected to redirect the user');
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
        </View>
      </ScrollView>
    );
  }

  private renderEmpty() {
    return (
      <EmptyScreen
        imageSrc={require('ASSETS/images/empty-screen/homework.png')}
        imgWidth={407}
        imgHeight={319}
        text={I18n.t('myapp-emptyScreenText')}
        title={I18n.t('myapp-emptyScreenTitle')}
      />
    );
  }

  public render() {
    let pageContent = null;
    const { modules, newModules } = this.props;

    if (modules.length === 0 && newModules.length === 0) {
      pageContent = this.renderEmpty();
    } else {
      pageContent = this.renderGrid(modules, newModules);
    }

    return (
      <PageView
        navigation={this.props.navigation}
        navBar={{
          title: I18n.t('MyApplications'),
        }}>
        {pageContent}
      </PageView>
    );
  }
}

export default withViewTracking('myapps')(MyAppGrid);
