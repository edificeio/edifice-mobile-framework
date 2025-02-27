import * as React from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import ImageInput from '../../components/image-input';
import moduleConfig from '../../module-config';
import styles from './styles';
import type { WikiHomeScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import { UI_SIZES } from '~/framework/components/constants';
import BottomSheetModal from '~/framework/components/modals/bottom-sheet';
import { PageView } from '~/framework/components/page';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText, BodyText } from '~/framework/components/text';
import { WikiNavigationParams, wikiRouteNames } from '~/framework/modules/wiki/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<WikiNavigationParams, typeof wikiRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('wiki-home-title'),
  }),
});

const choosePicsMenu = () => {
  return (
    // <BottomSheetModal ref={choosePicsMenuRef} onDismiss={handleChoosePicsMenuDismissed}>
    <BottomSheetModal>
      <DefaultButton
        iconLeft="ui-image"
        text={I18n.get('pickfile-image')}
        contentColor={theme.palette.complementary.green.regular}
        disabled
        style={styles.choosePicsMenuTitle}
      />
      {/* <TouchableOpacity style={styles.choosePicsMenuElement} onPress={handleTakePic}> */}
      <TouchableOpacity style={styles.choosePicsMenuElement}>
        <Svg
          height={UI_SIZES.elements.icon.default}
          width={UI_SIZES.elements.icon.default}
          name="ui-camera"
          fill={theme.palette.grey.black}
        />
        <BodyText>{I18n.get('pickfile-take')}</BodyText>
      </TouchableOpacity>
      <View style={styles.choosePicsMenuSeparator} />
      {/* <TouchableOpacity style={styles.choosePicsMenuElement} onPress={handleChoosePics}> */}
      <TouchableOpacity style={styles.choosePicsMenuElement}>
        <Svg
          height={UI_SIZES.elements.icon.default}
          width={UI_SIZES.elements.icon.default}
          name="ui-smartphone"
          fill={theme.palette.grey.black}
        />
        <BodyText>{I18n.get('pickfile-pick')}</BodyText>
      </TouchableOpacity>
    </BottomSheetModal>
  );
};

export default function WikiHomeScreen(props: WikiHomeScreenPrivateProps) {
  return (
    <PageView>
      <KeyboardAvoidingView
        // keyboardVerticalOffset={headerHeight}
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <BodyBoldText>wiki home screen</BodyBoldText>
        <ImageInput moduleConfig={moduleConfig} />
      </KeyboardAvoidingView>
    </PageView>
  );
}
