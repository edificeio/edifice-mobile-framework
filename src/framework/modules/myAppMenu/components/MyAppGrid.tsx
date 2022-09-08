import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { NavigationInjectedProps } from 'react-navigation';

import { ActionButton } from '~/framework/components/ActionButton';
import GridList from '~/framework/components/GridList';
import { TouchableSelectorPictureCard } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { InfoBubble } from '~/framework/components/infoBubble';
import { PageView } from '~/framework/components/page';
import { AnyNavigableModule, NavigableModuleArray } from '~/framework/util/moduleTool';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { IAppModule } from '~/infra/moduleTool/types';

export interface MyAppGrid_Props extends NavigationInjectedProps {
  modules: NavigableModuleArray;
  legacyModules: IAppModule[];
}

class MyAppGrid extends React.PureComponent<MyAppGrid_Props> {
  private renderGrid(modules?: NavigableModuleArray, legacyModules?: IAppModule[]) {
    const allModules = [...(legacyModules || []), ...(modules || [])]?.sort((a, b) =>
      I18n.t(a.config.displayI18n).localeCompare(I18n.t(b.config.displayI18n)),
    ) as NavigableModuleArray;

    const renderGridItem = ({ item }: { item: AnyNavigableModule }) => {
      return (
        <TouchableSelectorPictureCard
          onPress={() => this.props.navigation.navigate(item.config.name)}
          text={I18n.t(item.config.displayI18n)}
          picture={
            item.config.displayPicture
              ? item.config.displayPicture.type === 'NamedSvg'
                ? { ...item.config.displayPicture, height: 64, width: '100%' }
                : item.config.displayPicture.type === 'Image'
                ? { ...item.config.displayPicture }
                : /* item.config.displayPicture.type === 'Icon' */ { ...item.config.displayPicture, size: 64 }
              : {
                  // Fallback on legacy moduleConfig properties
                  type: 'Icon',
                  color: item.config['iconColor'],
                  name: item.config['iconName'],
                  size: 64,
                }
          }
          pictureStyle={item.config.displayPicture?.type === 'Image' ? { height: 64, width: '100%' } : {}}
        />
      );
    };

    return (
      <GridList
        data={allModules}
        renderItem={renderGridItem}
        keyExtractor={item => item.config.name}
        gap={UI_SIZES.spacing.big}
        gapOutside={UI_SIZES.spacing.big}
        ListFooterComponent={this.renderFooter()}
        ListFooterComponentStyle={{ flexGrow: 1, justifyContent: 'flex-end', marginVertical: UI_SIZES.spacing.big }}
        alwaysBounceVertical={false}
        overScrollMode="never"
        contentContainerStyle={{ flexGrow: 1 }}
      />
    );
  }

  private renderFooter() {
    return (
      <View style={{ height: Platform.OS === 'android' ? 40 : undefined }}>
        <ActionButton text={I18n.t('myapp-accessWeb')} url="/welcome" type="secondary" />
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
    const { modules, legacyModules } = this.props;
    return (
      <PageView
        navigation={this.props.navigation}
        navBar={{
          title: I18n.t('MyApplications'),
        }}>
        {this.renderGrid(modules, legacyModules)}
      </PageView>
    );
  }
}

export default withViewTracking('myapps')(MyAppGrid);
