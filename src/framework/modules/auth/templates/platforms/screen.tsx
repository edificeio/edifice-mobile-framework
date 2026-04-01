import * as React from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';

import styles from './styles';
import type { AuthPlatformsScreenProps } from './types';

import { I18n } from '~/app/i18n';
import { navigationDispatchMultiple } from '~/app/navigation';
import { TouchableSelectorPictureCard } from '~/framework/components/card/pictureCard';
import { UI_SIZES } from '~/framework/components/constants';
import GridList from '~/framework/components/GridList';
import { HeadingSText, SmallText } from '~/framework/components/text';
import { DebugOptions } from '~/framework/modules/debug';
import appConf, { Platform } from '~/framework/util/appConf';

export function AuthPlatformsScreenTemplate(props: AuthPlatformsScreenProps) {
  const { getNextRoute, navigation } = props;
  const onOpenItem = React.useCallback(
    (item: Platform) => navigationDispatchMultiple(navigation, getNextRoute(navigation, item)),
    [getNextRoute, navigation],
  );
  return (
    <GridList
      data={appConf.platforms}
      renderItem={({ item }) => (
        <TouchableSelectorPictureCard
          picture={item.logoType === 'Image' ? { source: item.logo, type: 'Image' } : { name: item.logo, type: item.logoType }}
          pictureStyle={styles.picture}
          text={item.displayName}
          onPress={() => onOpenItem(item)}
          testID={`network-${item.name}`}
        />
      )}
      keyExtractor={item => item.url}
      ListHeaderComponent={
        <SafeAreaView edges={React.useMemo(() => ['top'], [])}>
          <HeadingSText style={styles.heading} testID="network-welcome-title">
            {I18n.get('auth-platformselect-welcome')}
          </HeadingSText>
          <SmallText style={styles.lightP} testID="network-welcome-subtitle">
            {I18n.get('auth-platformselect-select')}
          </SmallText>
        </SafeAreaView>
      }
      alwaysBounceVertical={false}
      overScrollMode="never"
      ListFooterComponent={<DebugOptions />}
      gap={UI_SIZES.spacing.big}
      gapOutside={UI_SIZES.spacing.big}
    />
  );
}

export default AuthPlatformsScreenTemplate;
