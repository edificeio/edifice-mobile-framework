import { View } from 'react-native';

import { HeaderButton } from '@react-navigation/elements';

import { screenOptions } from '~/app/navigation/util';
import { SelfAvatar } from '~/framework/components/avatar/self';
import { UI_SIZES } from '~/framework/components/constants';
import { withSession } from '~/framework/modules/auth/util';

import { styles } from './styles';
import { HomeScreenProps } from './types';
import React from 'react';
import theme from '~/app/theme';
import { BodyBoldText } from '~/framework/components/text';
import { useSelector } from 'react-redux';
import { selectors } from '../../auth/redux/reducer';

export const HomeScreenOptions = screenOptions(({ navigation }) => ({
  headerStyle: {
    backgroundColor: theme.palette.grey.white.toString(),
  },
  headerBackground: () => null,
  headerShadowVisible: false,
  headerLeft: () => (
    <HeaderButton
      style={styles.avatarHeaderButton}
      testID="timeline-profile-button"
      onPress={() => navigation.navigate('user')}
      pressColor="transparent">
      <View style={{ padding: UI_SIZES.border.small }}>
        <SelfAvatar size="sm" />
      </View>
    </HeaderButton>
  ),

  headerTitle: HomeScreenNavBarTitle,
  headerTintColor: theme.palette.grey.black.toString(),
  unstable_headerLeftItems: () => [
    {
      element: (
        <HeaderButton
          style={styles.avatarHeaderButton}
          testID="timeline-profile-button"
          onPress={() => navigation.navigate('user')}>
          <View style={{ padding: UI_SIZES.border.small }}>
            <SelfAvatar size="sm" />
          </View>
        </HeaderButton>
      ),
      type: 'custom',
    },
  ],
}));

export const HomeScreenNavBarTitle = function ({}) {
  const session = useSelector(selectors.session);
  return <BodyBoldText numberOfLines={1}>{session?.user.displayName}</BodyBoldText>;
};

export const HomeScreen = withSession(function ({}: HomeScreenProps) {});
