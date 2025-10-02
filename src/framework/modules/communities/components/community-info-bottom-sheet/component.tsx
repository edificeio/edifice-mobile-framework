import * as React from 'react';
import { View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from './styles';
import { CommunityInfoBottomSheetProps } from './types';

import { I18n } from '~/app/i18n';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { Svg } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import { BodyText, HeadingXSText } from '~/framework/components/text';
import CommunityCardLarge from '~/framework/modules/communities/components/community-card-large';

const CommunityInfoBottomSheet = React.forwardRef<BottomSheetModalMethods, CommunityInfoBottomSheetProps>(({ data }, ref) => {
  const { bottom } = useSafeAreaInsets();

  const containerStyle = React.useMemo(
    () => [
      styles.container,
      {
        paddingBottom: bottom,
      },
    ],
    [bottom],
  );

  return (
    <BottomSheetModal ref={ref} gutters={false} includeSafeArea={false} closeButton>
      <ScrollView contentContainerStyle={containerStyle} alwaysBounceVertical={false}>
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
      </ScrollView>
    </BottomSheetModal>
  );
});

export default CommunityInfoBottomSheet;
