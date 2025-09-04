import * as React from 'react';
import { Platform, SafeAreaView, TouchableOpacity, View } from 'react-native';

import { styles } from './styles';
import { CommunityInfoBottomSheetProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { Svg } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import { BodyText, HeadingXSText } from '~/framework/components/text';
import CommunityCardLarge from '~/framework/modules/communities/components/community-card-large';

const CommunityInfoBottomSheet = React.forwardRef<BottomSheetModalMethods, CommunityInfoBottomSheetProps>(({ data }, ref) => {
  const closeBottomSheet = React.useCallback(() => {
    (ref as React.RefObject<BottomSheetModalMethods>)?.current?.dismiss();
  }, [ref]);

  const containerStyle = React.useMemo(
    () => [
      styles.container,
      {
        paddingBottom: UI_SIZES.spacing.medium,
        paddingTop:
          UI_SIZES.elements.navbarHeight + Platform.select({ default: UI_SIZES.spacing.small, ios: UI_SIZES.spacing.big }),
      },
    ],
    [],
  );

  return (
    <BottomSheetModal ref={ref} style={styles.bottomSheetPaddingBottom}>
      <ScrollView>
        <View style={styles.listHeader}>
          <TouchableOpacity onPress={closeBottomSheet} style={styles.closeButton}>
            <Svg
              name="ui-close"
              height={UI_SIZES.elements.icon.small}
              width={UI_SIZES.elements.icon.small}
              fill={theme.palette.grey.black}
            />
          </TouchableOpacity>
        </View>
        <SafeAreaView style={containerStyle}>
          <CommunityCardLarge
            title={data?.title}
            image={data?.image}
            membersCount={data?.totalMembers}
            senderId={data?.senderId}
            senderName={data?.senderName}
            role={data?.role}
          />
          <View style={styles.welcomeNote}>
            <View style={styles.welcomeNoteTitleContainer}>
              <Svg name="ui-notes" fill={styles.welcomeNoteTitle.color} />
              <HeadingXSText style={styles.welcomeNoteTitle}>{I18n.get('community-welcome-note')}</HeadingXSText>
            </View>
            <BodyText>{data?.welcomeNote}</BodyText>
          </View>
        </SafeAreaView>
      </ScrollView>
    </BottomSheetModal>
  );
});

export default CommunityInfoBottomSheet;
