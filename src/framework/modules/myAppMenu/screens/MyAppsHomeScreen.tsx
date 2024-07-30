import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { I18n } from '~/app/i18n';
import GridList from '~/framework/components/GridList';
import { TouchableSelectorPictureCard } from '~/framework/components/card/pictureCard';
import { UI_SIZES } from '~/framework/components/constants';
import FlatList from '~/framework/components/list/flat-list';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { HeadingXSText } from '~/framework/components/text';
import OtherModuleElement from '~/framework/modules/myAppMenu/components/other-module';
import { IMyAppsNavigationParams, myAppsRouteNames } from '~/framework/modules/myAppMenu/navigation';
import { AnyNavigableModule, NavigableModuleArray } from '~/framework/util/moduleTool';

export interface MyAppsHomeScreenProps extends NativeStackScreenProps<IMyAppsNavigationParams, typeof myAppsRouteNames.Home> {
  modules: NavigableModuleArray;
  secondaryModules: NavigableModuleArray;
  connectors: NavigableModuleArray;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  image: { height: 64, width: '100%' },
  otherModules: { paddingBottom: UI_SIZES.screen.bottomInset },
  flatlist: { paddingHorizontal: UI_SIZES.spacing.medium },
  otherModulesTitle: {
    marginBottom: UI_SIZES.spacing.minor,
    marginTop: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
});

const MyAppsHomeScreen = (props: MyAppsHomeScreenProps) => {
  const renderGrid = () => {
    const allModules = (props.modules ?? [])?.sort((a, b) =>
      I18n.get(a.config.displayI18n).localeCompare(I18n.get(b.config.displayI18n)),
    ) as NavigableModuleArray;

    const renderGridItem = ({ item }: { item: AnyNavigableModule }) => {
      return (
        <TouchableSelectorPictureCard
          onPress={() => props.navigation.navigate(item.config.routeName)}
          text={I18n.get(item.config.displayI18n)}
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
      <GridList
        data={allModules}
        renderItem={renderGridItem}
        keyExtractor={item => item.config.name}
        gap={UI_SIZES.spacing.big}
        gapOutside={UI_SIZES.spacing.big}
        alwaysBounceVertical={false}
        overScrollMode="never"
        contentContainerStyle={styles.container}
        bottomInset={false}
      />
    );
  };

  const renderOtherModules = () => {
    const secondaryModules = (props.secondaryModules ?? [])?.sort((a, b) =>
      I18n.get(a.config.displayI18n).localeCompare(I18n.get(b.config.displayI18n)),
    ) as NavigableModuleArray;
    const connectors = (props.connectors ?? [])?.sort((a, b) =>
      I18n.get(a.config.displayI18n).localeCompare(I18n.get(b.config.displayI18n)),
    ) as NavigableModuleArray;
    return (
      <View style={styles.otherModules}>
        <HeadingXSText style={styles.otherModulesTitle}>{I18n.get('myapp-othermodules-title')}</HeadingXSText>

        <FlatList
          bottomInset={false}
          renderItem={({ item }) => <OtherModuleElement item={item} type="secondaryModule" />}
          data={secondaryModules}
          style={styles.flatlist}
        />
        <FlatList
          bottomInset={false}
          renderItem={({ item }) => <OtherModuleElement item={item} type="connector" />}
          data={connectors}
          style={styles.flatlist}
        />
      </View>
    );
  };

  return (
    <PageView>
      <ScrollView>
        {renderGrid()}
        {renderOtherModules()}
      </ScrollView>
    </PageView>
  );
};

export default MyAppsHomeScreen;
