import * as React from 'react';
import { Platform, ScrollView, View } from 'react-native';

import { InvitationClient, InvitationStatus } from '@edifice.io/community-client-rest-rn';
import { InvitationResponseDtoWithThumbnails } from '@edifice.io/community-client-rest-rn/utils';
import { Header, HeaderBackButton, useHeaderHeight } from '@react-navigation/elements';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { defaultScreenOptions } from '~/app/navigation/layout';
import { modalScreenOptions } from '~/app/navigation/util';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { LOADING_ITEM_DATA } from '~/framework/components/list/paginated-list';
import { Svg } from '~/framework/components/picture';
import { sessionScreen } from '~/framework/components/screen';
import { BodyText, HeadingXSText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import CommunityCardLarge from '~/framework/modules/communities/components/community-card-large';
import moduleConfig from '~/framework/modules/communities/module-config';
import { communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { communitiesSelectors } from '~/framework/modules/communities/store';
import { toURISource } from '~/framework/util/media';
import { accountApi } from '~/framework/util/transport';
import { HTTPError } from '~/framework/util/transport/error';

import styles from './styles';
import type { CommunitiesJoinConfirmScreen } from './types';

export const computeNavBar = modalScreenOptions('formSheet', () => ({
  headerBlurEffect: 'regular',
  headerShadowVisible: false,
  headerTintColor: theme.ui.text.regular.toString(),
  headerTransparent: Platform.select({ default: false, ios: true }), // formSheet + headerTransparent causes crash on android
  sheetAllowedDetents: 'fitToContents',
  sheetCornerRadius: Platform.select({ default: UI_SIZES.radius.mediumPlus, ios: undefined }),
  sheetGrabberVisible: false,
  title: I18n.get('communities-join-confirm-title'),
}));

export default sessionScreen<Readonly<CommunitiesJoinConfirmScreen.AllProps>>(function CommunitiesJoinConfirmScreen({
  navigation,
  route: {
    params: { communityId, invitationId },
  },
  route,
  session,
}) {
  const onValidate = React.useCallback(async () => {
    try {
      await accountApi(session, moduleConfig, InvitationClient).updateInvitationStatus(invitationId, {
        status: InvitationStatus.ACCEPTED,
      });
      navigation.replace(communitiesRouteNames.home, { communityId, invitationId, showWelcome: true });
    } catch (e) {
      console.error(e);
      if (e instanceof HTTPError) {
        console.error(await e.read(e.text));
      }
      toast.showError(I18n.get('communities-invitation-accept-error'));
    }
  }, [communityId, invitationId, navigation, session]);

  const data = useSelector(communitiesSelectors.getPendingCommunities).find(
    invitation => invitation !== LOADING_ITEM_DATA && invitation.id === invitationId,
  ) as InvitationResponseDtoWithThumbnails | undefined;

  // const insets = useSafeAreaInsets();

  const headerHeight = Platform.select({ default: 0, ios: useHeaderHeight() });
  const insets = useSafeAreaInsets();

  const containerStyle = React.useMemo(
    () => [
      styles.container,
      {
        marginBottom: -headerHeight - insets.bottom,
        paddingBottom: UI_SIZES.spacing.medium + insets.bottom,
        paddingTop: headerHeight,
      },
    ],
    [headerHeight, insets.bottom],
  );

  const navTheme = useTheme();
  const edges = React.useMemo(() => ['right', 'left', 'bottom'] as const, []);

  if (!data || !data.community) return <EmptyContentScreen />;
  const image = data.community?.mobileThumbnails?.length ? data.community.mobileThumbnails : toURISource(data.community.image!);
  return (
    <>
      {/* Android doest not support header automatically in formSheets. So, we must include it into the screen */}
      {Platform.OS === 'android' && (
        <Header
          {...defaultScreenOptions({ theme: navTheme })}
          {...computeNavBar({ navigation, route, theme: navTheme })}
          title={I18n.get('communities-join-confirm-title')}
          headerStyle={styles.androidHeaderStyle}
          headerShadowVisible={false}
          headerLeft={({ tintColor }) => (
            <HeaderBackButton
              backImage={({ tintColor: fill }) => (
                <Svg
                  name={'ui-close'}
                  fill={fill}
                  width={UI_SIZES.elements.navbarIconSize}
                  height={UI_SIZES.elements.navbarIconSize}
                />
              )}
              tintColor={tintColor}
              onPress={navigation.goBack}
              displayMode="minimal"
              testID="header-back"
            />
          )}
        />
      )}
      <ScrollView style={styles.page}>
        <SafeAreaView style={containerStyle} edges={edges}>
          <CommunityCardLarge
            title={data.community?.title}
            image={image}
            membersCount={data.communityStats?.totalMembers}
            senderId={data.sentBy.entId}
            senderName={data.sentBy.displayName}
            role={data.role}
          />
          <View style={styles.welcomeNote}>
            <View style={styles.welcomeNoteTitleContainer}>
              <Svg name="ui-notes" fill={styles.welcomeNoteTitle.color} />
              <HeadingXSText style={styles.welcomeNoteTitle}>{I18n.get('community-welcome-note')}</HeadingXSText>
            </View>
            <BodyText>{data.community?.welcomeNote}</BodyText>
          </View>
          <PrimaryButton text={I18n.get('community-invitation-validate')} action={onValidate} testID="validate-btn" />
          <TertiaryButton text={I18n.get('community-invitation-skip')} action={navigation.goBack} testID="skip-btn" />
        </SafeAreaView>
      </ScrollView>
    </>
  );
});
