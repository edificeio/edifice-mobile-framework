import * as React from 'react';
import { Platform, ScrollView, View } from 'react-native';

import { InvitationClient, InvitationStatus } from '@edifice.io/community-client-rest-rn';
import { InvitationResponseDtoWithThumbnails } from '@edifice.io/community-client-rest-rn/utils';
import { BlurView } from '@react-native-community/blur';
import { Header } from '@react-navigation/elements';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Edges, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import styles from './styles';
import type { CommunitiesJoinConfirmScreen } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { LOADING_ITEM_DATA } from '~/framework/components/list/paginated-list';
import { NavBarAction } from '~/framework/components/navigation';
import { Svg } from '~/framework/components/picture';
import { sessionScreen } from '~/framework/components/screen';
import { BodyText, HeadingSText, HeadingXSText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import CommunityCardLarge from '~/framework/modules/communities/components/community-card-large';
import moduleConfig from '~/framework/modules/communities/module-config';
import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { communitiesSelectors } from '~/framework/modules/communities/store';
import { navBarOptions } from '~/framework/navigation/navBar';
import { toURISource } from '~/framework/util/media';
import { accountApi } from '~/framework/util/transport';
import { HTTPError } from '~/framework/util/transport/error';

const ScreenHeader = ({ navigation }) => {
  const { top } = useSafeAreaInsets();
  return (
    <Header
      modal
      headerStyle={React.useMemo(
        () => ({
          height:
            UI_SIZES.elements.navbarHeight +
            Platform.select({ default: UI_SIZES.spacing.small, ios: UI_SIZES.spacing.big }) +
            (Platform.OS === 'android' ? top : 0),
        }),
        [top],
      )}
      headerLeft={props => (
        <NavBarAction
          {...props}
          color={theme.palette.grey.darkness}
          onPress={navigation.goBack}
          icon="ui-close"
          testID="close-btn"
        />
      )}
      headerStatusBarHeight={Platform.OS === 'android' ? top : undefined}
      headerRight={() => <NavBarAction />}
      headerLeftContainerStyle={{
        paddingHorizontal: UI_SIZES.spacing.medium,
      }}
      headerRightContainerStyle={{
        paddingHorizontal: UI_SIZES.spacing.medium,
      }}
      title=""
      headerTransparent={Platform.select({ default: false, ios: true })}
      headerShadowVisible={false}
      headerTitleAlign="center"
      headerTitle={() => <HeadingSText style={styles.headerTitle}>{I18n.get('communities-join-confirm-title')}</HeadingSText>}
      headerBackground={Platform.select({
        default: undefined,
        ios: () => <BlurView reducedTransparencyFallbackColor="white" blurType="regular" style={styles.headerBlur} />,
      })}
    />
  );
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<
  CommunitiesNavigationParams,
  typeof communitiesRouteNames.joinConfirm
>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('communities-join-confirm-title'),
  }),
  header: ScreenHeader,
  headerBlurEffect: 'extraLight',
  headerShadowVisible: false,
  headerTransparent: true,
});

const safeEdges: Edges = {
  bottom: 'additive',
  left: 'additive',
  right: 'additive',
  top: 'off',
};

export default sessionScreen<Readonly<CommunitiesJoinConfirmScreen.AllProps>>(function CommunitiesJoinConfirmScreen({
  navigation,
  route: {
    params: { communityId, invitationId },
  },
  session,
}) {
  const { top } = useSafeAreaInsets();
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

  const pageStyle = React.useMemo(() => [styles.page, { paddingTop: Platform.OS === 'android' ? top : undefined }], [top]);

  if (!data || !data.community) return <EmptyContentScreen />;

  const image = data.community?.mobileThumbnails?.length ? data.community.mobileThumbnails : toURISource(data.community.image!);

  return (
    <ScrollView style={pageStyle}>
      <SafeAreaView style={containerStyle} edges={safeEdges}>
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
  );
});
