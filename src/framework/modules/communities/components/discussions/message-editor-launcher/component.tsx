import * as React from 'react';
import { Pressable, View } from 'react-native';

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { SingleAvatar } from '~/framework/components/avatar';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { chat as chatInputStyles } from '~/framework/components/inputs/text2/style';
import { SmallItalicText } from '~/framework/components/text';
import { selectors } from '~/framework/modules/auth/redux/reducer';
import { isModalModeOnThisRoute } from '~/framework/navigation/hideTabBarAndroid';

import styles from './styles';
import { MessageEditorLauncherProps } from './types';

const FAKE_INPUT_STYLE = [UI_STYLES.flex1, chatInputStyles.wrapper, styles.fakeInput];

export const MessageEditorLauncher = ({ onPress, placeholder }: Readonly<MessageEditorLauncherProps>) => {
  const session = useSelector(selectors.session);
  const route = useRoute();
  const tabBarHeight = useBottomTabBarHeight() * (isModalModeOnThisRoute(route.name) ? 0 : 1);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const rootStyle = React.useMemo(
    () => [styles.root, { paddingBottom: UI_SIZES.spacing.medium + Math.max(bottomInset - tabBarHeight, 0) }],
    [bottomInset, tabBarHeight],
  );

  return (
    <View style={rootStyle}>
      <SingleAvatar size="md" userId={session?.user.id} />
      <Pressable style={FAKE_INPUT_STYLE} onPress={onPress} testID="open-editor-modal">
        <SmallItalicText style={styles.placeholder} numberOfLines={1}>
          {placeholder}
        </SmallItalicText>
      </Pressable>
    </View>
  );
};
