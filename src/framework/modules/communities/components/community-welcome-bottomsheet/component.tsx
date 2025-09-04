import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { MembershipRole } from '@edifice.io/community-client-rest-rn';
import LottieView from 'lottie-react-native';
import { Trans } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import styles from './styles';
import { CommunityWelcomeBottomSheetModalProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import CustomBottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText, BodyText, HeadingMText, SmallBoldText, SmallText } from '~/framework/components/text';
import { useSyncRef } from '~/framework/hooks/ref';

const introI18n = {
  [MembershipRole.ADMIN]: 'community-join-onboarding-intro-admin',
  [MembershipRole.MEMBER]: 'community-join-onboarding-intro-member',
};

const cardItems = {
  [MembershipRole.ADMIN]: [
    { i18n: 'community-join-onboarding-admin-item-1', svg: 'ui-addUser' },
    { i18n: 'community-join-onboarding-admin-item-2', svg: 'ui-send' },
    { i18n: 'community-join-onboarding-admin-item-3', svg: 'ui-addFolder' },
    { i18n: 'community-join-onboarding-admin-item-4', svg: 'ui-settings' },
  ],
  [MembershipRole.MEMBER]: [
    { i18n: 'community-join-onboarding-member-item-1', svg: 'ui-folderMove' },
    { i18n: 'community-join-onboarding-member-item-2', svg: 'ui-megaphone' },
    { i18n: 'community-join-onboarding-member-item-3', svg: 'ui-messageInfo' },
  ],
};

const animationSource = require('ASSETS/animations/community/hands-clap.json');

export const CommunityWelcomeBottomSheetModal = React.forwardRef<
  BottomSheetModalMethods,
  Readonly<CommunityWelcomeBottomSheetModalProps>
>(function CommunityWelcomeBottomSheetModal({ role, title }, _ref) {
  const ref = React.useRef<BottomSheetModalMethods>(null);
  const syncRef = useSyncRef(_ref, ref);
  const onClose = React.useCallback(() => {
    ref.current?.dismiss();
  }, []);
  return (
    <CustomBottomSheetModal ref={syncRef} style={styles.modal}>
      <SafeAreaView style={styles.page} edges={{ bottom: 'maximum', left: 'maximum', right: 'maximum', top: 'off' }}>
        <TouchableOpacity onPress={onClose} style={styles.close}>
          <Svg
            name="ui-close"
            height={UI_SIZES.elements.icon.small}
            width={UI_SIZES.elements.icon.small}
            fill={theme.palette.grey.black}
          />
        </TouchableOpacity>
        <HeadingMText style={styles.text}>{I18n.get('community-join-onboarding-title')}</HeadingMText>

        <LottieView autoPlay loop={false} resizeMode="contain" source={animationSource} style={styles.animation} />
        <BodyText style={styles.text}>
          <Trans i18nKey={introI18n[role]} values={{ name: title }} components={{ b: <BodyBoldText /> }} />
        </BodyText>
        <View style={styles.card}>
          <View style={styles.cardLine} />
          {cardItems[role].map(item => (
            <View style={styles.cardItem} key={item.i18n}>
              <Svg
                style={styles.cardItemIcon}
                name={item.svg}
                width={UI_SIZES.elements.icon.small}
                height={UI_SIZES.elements.icon.small}
                fill={theme.ui.text.regular}
              />
              <SmallText style={styles.cardItemText}>
                <Trans i18nKey={item.i18n} components={{ b: <SmallBoldText /> }} />
              </SmallText>
            </View>
          ))}
        </View>
        <PrimaryButton action={onClose} text={I18n.get('community-join-onboarding-ok')} />
      </SafeAreaView>
    </CustomBottomSheetModal>
  );
});
