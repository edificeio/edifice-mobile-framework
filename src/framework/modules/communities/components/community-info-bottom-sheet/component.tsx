import * as React from 'react';
import { Platform, StatusBar, View } from 'react-native';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from './styles';
import { CommunityInfoBottomSheetProps } from './types';

import { I18n } from '~/app/i18n';
import { UI_SIZES } from '~/framework/components/constants';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { Svg } from '~/framework/components/picture';
import { BodyText, HeadingXSText } from '~/framework/components/text';
import CommunityCardLarge from '~/framework/modules/communities/components/community-card-large';

const CommunityInfoBottomSheet = React.forwardRef<BottomSheetModalMethods, CommunityInfoBottomSheetProps>(({ data }, ref) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <BottomSheetModal ref={ref} gutters={false} includeSafeArea={false} closeButton enableOverDrag={false}>
      <BottomSheetScrollView
        contentContainerStyle={styles.container}
        alwaysBounceVertical={false}
        style={React.useMemo(
          () => ({
            maxHeight:
              UI_SIZES.screen.height -
              (StatusBar.currentHeight ?? 0) -
              UI_SIZES.elements.navbarHeight -
              UI_SIZES.elements.icon.small -
              UI_SIZES.spacing.medium,
          }),
          [],
        )}>
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
        <View
          style={React.useMemo(
            () => ({
              height: Platform.select({ android: bottom + UI_SIZES.spacing.large, ios: bottom * 2 + UI_SIZES.spacing.minor }),
            }),
            [bottom],
          )}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

export default CommunityInfoBottomSheet;
