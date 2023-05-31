import { NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import GridList from '~/framework/components/GridList';
import { ActionButton } from '~/framework/components/buttons/action';
import { TouchableSelectorPictureCard } from '~/framework/components/card/pictureCard';
import { UI_SIZES } from '~/framework/components/constants';
import { InfoBubble } from '~/framework/components/infoBubble';
import { PageView } from '~/framework/components/page';
import { IMyAppsNavigationParams, myAppsRouteNames } from '~/framework/modules/myAppMenu/navigation';
import { AnyNavigableModule, NavigableModuleArray } from '~/framework/util/moduleTool';

export interface MyAppsHomeScreenProps extends NativeStackScreenProps<IMyAppsNavigationParams, typeof myAppsRouteNames.Home> {
  modules: NavigableModuleArray;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  footer: { flexGrow: 1, justifyContent: 'flex-end', marginVertical: UI_SIZES.spacing.big },
  image: { height: 64, width: '100%' },
});

class MyAppsHomeScreen extends React.PureComponent<MyAppsHomeScreenProps> {
  private renderGrid(modules?: NavigableModuleArray) {
    const allModules = (modules ?? [])?.sort((a, b) =>
      I18n.t(a.config.displayI18n).localeCompare(I18n.t(b.config.displayI18n)),
    ) as NavigableModuleArray;

    const renderGridItem = ({ item }: { item: AnyNavigableModule }) => {
      return (
        <TouchableSelectorPictureCard
          onPress={() => this.props.navigation.navigate(item.config.routeName)}
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
                  // eslint-disable-next-line @typescript-eslint/dot-notation
                  color: item.config['iconColor'],
                  // eslint-disable-next-line @typescript-eslint/dot-notation
                  name: item.config['iconName'],
                  size: 64,
                }
          }
          pictureStyle={item.config.displayPicture?.type === 'Image' ? styles.image : {}}
        />
      );
    };

    return (
      <>
        <GridList
          data={allModules}
          renderItem={renderGridItem}
          keyExtractor={item => item.config.name}
          gap={UI_SIZES.spacing.big}
          gapOutside={UI_SIZES.spacing.big}
          ListFooterComponent={this.renderFooter()}
          ListFooterComponentStyle={styles.footer}
          alwaysBounceVertical={false}
          overScrollMode="never"
          contentContainerStyle={styles.container}
        />
      </>
    );
  }

  private renderFooter() {
    return (
      <>
        <ActionButton text={I18n.t('myapp-accessWeb')} url="/welcome" type="secondary" />
        <InfoBubble
          infoText={I18n.t('myapp-infoBubbleText', { appName: DeviceInfo.getApplicationName() })}
          infoTitle={I18n.t('myapp-infoBubbleTitle')}
          infoImage={require('ASSETS/images/my-apps-infobubble.png')}
          infoBubbleType="floating"
          infoBubbleId="myAppsScreen.redirect"
        />
      </>
    );
  }

  public render() {
    const { modules } = this.props;
    return <PageView>{this.renderGrid(modules)}</PageView>;
  }
}

export default MyAppsHomeScreen;
