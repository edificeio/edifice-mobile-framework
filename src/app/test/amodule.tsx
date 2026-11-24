import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EntModule } from '~/app/module';
import {
  defineModal,
  defineScreen,
  headerAction,
  HeaderActionButton,
  headerCustom,
  headerLeftActions,
  headerMenu,
  headerRightActions,
  headerSpacing,
  menuAction,
  menuSubmenu,
  sharedTransitions,
  StackNavigation,
} from '~/app/navigation-new';
import { SingleAvatar } from '~/framework/components/avatar';
import { SelfAvatar } from '~/framework/components/avatar/self';
import { PrimaryButton } from '~/framework/components/button';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { BodyBoldText, BodyText, HeadingSText } from '~/framework/components/text';
import { useStorageNumber } from '~/framework/util/storage/hooks';
import { Audience } from '~/modules/audience/components';
import type { AudienceReferer } from '~/modules/audience/model';
import { AccountsButton } from '~/modules/auth/components';
import { useAuthFlows } from '~/modules/auth/flows';
import { withSession } from '~/modules/auth/hoc';
import { useOpenMedia } from '~/modules/media/hooks';
import { ImageMedia, MediaType } from '~/modules/media/types';
import { I18n } from '~/util/i18n';

import { preferences, storage } from './amodule-storage';

const styles = StyleSheet.create({
  button: { alignSelf: 'center' },
  col: { alignItems: 'flex-start', alignSelf: 'flex-start', gap: UI_SIZES.spacing.medium },
  contentContainer: { gap: UI_SIZES.spacing.medium, padding: UI_SIZES.spacing.medium },
  image: { borderRadius: 8, ...StyleSheet.absoluteFill },
  imageButton: { height: 100, width: 300 },
  imageFull: { aspectRatio: 1.5, flex: 1 },
  row: { alignItems: 'center', flexDirection: 'row', gap: UI_SIZES.spacing.medium, justifyContent: 'flex-start' },
  rowCenter: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.medium,
    justifyContent: 'center',
  },
});

// Resource of the reactions test. A fictitious one: replace it by a real resource of the platform (a blog post…) to react for real.
const AUDIENCE_TEST_REFERER: AudienceReferer = { module: 'blog', resourceId: 'audience-test', resourceType: 'post' };
const AUDIENCE_TEST_NAVIGATION_DELAY = 3000;

// `withSession`: the hooks of an account storage work on the account of the session
const AModuleHomeScreen = withSession<StaticScreenProps<undefined>>(function ({ session }) {
  const navigation = useNavigation();
  const { confirmLogout } = useAuthFlows();
  // Pilot of the storage API: a counter of the device, and a number of the account. Both render again when they change.
  const [launchCount] = useStorageNumber(storage, 'launch-count');
  const [favoriteNumber, setFavoriteNumber] = useStorageNumber(preferences, 'favorite-number');
  React.useEffect(() => {
    storage.set('launch-count', (storage.getNumber('launch-count') ?? 0) + 1);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <HeadingSText>Compte connecté</HeadingSText>
      <View style={styles.col}>
        <View style={styles.row}>
          <SingleAvatar size="sm" userId={session.user.id} />
          <BodyBoldText style={UI_STYLES.flex1} numberOfLines={1}>
            {session.user.displayName}
          </BodyBoldText>
          <PrimaryButton testID="logout" text="Se déconnecter" onPress={confirmLogout} />
        </View>
        <View style={styles.rowCenter}>
          <AccountsButton testID="home-accounts" />
        </View>
      </View>

      <HeadingSText>Test navigation</HeadingSText>
      <PrimaryButton
        style={styles.rowCenter}
        testID="1"
        text="Ouvrir la modale"
        onPress={() => {
          navigation.navigate('amodule/modal', { skibidi: 'Nom de la modale très très long avec du texte' });
        }}
      />
      <View style={styles.rowCenter}>
        <TouchableOpacity
          style={styles.imageButton}
          onPress={() => {
            navigation.navigate('amodule/details', { aId: 2 });
          }}>
          <Animated.Image
            source={{ uri: 'https://picsum.photos/id/39/200' }}
            style={styles.image}
            sharedTransitionTag="sharedTag"
            sharedTransitionStyle={sharedTransitions.default}
          />
        </TouchableOpacity>
      </View>

      <HeadingSText>Test storage</HeadingSText>
      <View style={styles.row}>
        <BodyText>{`Lancements sur l'appareil : ${launchCount ?? 0}`}</BodyText>
      </View>
      <View style={styles.row}>
        <BodyText>{`Stockage compte : ${favoriteNumber ?? 0}`}</BodyText>
        <PrimaryButton testID="favorite" text="Compte +1" onPress={() => setFavoriteNumber((favoriteNumber ?? 0) + 1)} />
      </View>

      <HeadingSText>Test réactions</HeadingSText>
      <Audience referer={AUDIENCE_TEST_REFERER} session={session} isManager />
      {/* Opens another screen in 3 s, the time to open the reaction picker: it must close (the screen stays mounted under). */}
      <PrimaryButton
        style={styles.rowCenter}
        testID="audience-delayed-navigation"
        text="Naviguer dans 3 s"
        onPress={() => setTimeout(() => navigation.navigate('amodule/details', { aId: 3 }), AUDIENCE_TEST_NAVIGATION_DELAY)}
      />
      {/* Same with a modal of the navigation (iOS: presented while the reaction picker is dismissed). */}
      <PrimaryButton
        style={styles.rowCenter}
        testID="audience-delayed-modal"
        text="Ouvrir une modale dans 3 s"
        onPress={() =>
          setTimeout(
            () => navigation.navigate('amodule/modal', { skibidi: 'Modale ouverte pendant le sélecteur' }),
            AUDIENCE_TEST_NAVIGATION_DELAY,
          )
        }
      />

      <HeadingSText>Test scroll</HeadingSText>
      <BodyText style={styles.row}>1</BodyText>
      <BodyText style={styles.row}>2</BodyText>
      <BodyText style={styles.row}>3</BodyText>
      <BodyText style={styles.row}>4</BodyText>
      <BodyText style={styles.row}>5</BodyText>
    </ScrollView>
  );
});

/** Shows what an item of the header does (test module). */
const showPressed = (name: string) => Alert.alert('Header', name);

const AModuleHomeScreenDeclaration = defineScreen({
  options: ({ navigation }) => ({
    title: 'Accueil',
    ...headerLeftActions(
      headerCustom(
        <HeaderActionButton
          accessibilityLabel={I18n.get('user-profile-myaccount')}
          icon={<SelfAvatar size="sm" />}
          onPress={() => navigation.navigate('user')}
          testID="timeline-profile-button"
        />,
      ),
      // A button with text only: native on iOS, padded text on Android
      // headerAction({ label: 'Modifier', onPress: () => showPressed('Modifier'), testID: 'amodule-header-edit' }),
    ),
    // Showcase of the items of the header, from right to left: a button with an icon of the app, a native menu, a space, a native button
    // (badge on iOS 26)
    ...headerRightActions(
      // headerAction({ icon: 'ui-infoCircle', label: 'Infos', onPress: () => showPressed('Infos'), testID: 'amodule-header-info' }),
      headerMenu({
        icon: { android: 'ui-options', ios: { name: 'ellipsis.circle', type: 'sfSymbol' } },
        items: [
          menuAction({
            icon: { android: 'ic_share', ios: { name: 'square.and.arrow.up', type: 'sfSymbol' } },
            label: 'Partager',
            onPress: () => showPressed('Partager'),
            testID: 'amodule-header-menu-share',
          }),
          menuSubmenu({
            items: [
              menuAction({
                label: 'Copier',
                onPress: () => showPressed('Copier'),
                state: 'on',
                testID: 'amodule-header-menu-copy',
              }),
              menuAction({
                disabled: true,
                label: 'Désactivé',
                onPress: () => showPressed('Désactivé'),
                testID: 'amodule-header-menu-disabled',
              }),
              menuAction({
                destructive: true,
                label: 'Supprimer',
                onPress: () => showPressed('Supprimer'),
                testID: 'amodule-header-menu-delete',
              }),
            ],
            label: 'Plus',
            testID: 'amodule-header-menu-more',
          }),
        ],
        label: 'Options',
        testID: 'amodule-header-menu',
        title: 'Options',
      }),
      // headerSpacing(),
      // headerAction({
      //  icon: { android: 'ui-plus', ios: { name: 'plus', type: 'sfSymbol' } },
      //  ios: { badge: { value: 3 } },
      //  label: 'Ajouter',
      //  onPress: () => showPressed('Ajouter'),
      //  testID: 'amodule-header-add',
      // }),
    ),
  }),
  screen: AModuleHomeScreen,
});

function AModuleDetailsScreen({}: StaticScreenProps<{
  aId: number;
}>) {
  const navigation = useNavigation<StackNavigation>();
  const { openMedia } = useOpenMedia();
  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <HeadingSText>Détails</HeadingSText>
      <TouchableOpacity
        style={styles.rowCenter}
        onPress={() => {
          openMedia(
            {
              mime: 'image/*',
              src: { uri: 'https://picsum.photos/id/39/200' },
              type: MediaType.IMAGE,
            } as ImageMedia,
            { title: 'Un super titre' },
          );
        }}>
        <Animated.Image
          source={{ uri: 'https://picsum.photos/id/39/200' }}
          style={styles.imageFull}
          sharedTransitionTag="sharedTag"
          sharedTransitionStyle={sharedTransitions.default}
        />
      </TouchableOpacity>
      <PrimaryButton
        testID="1"
        text="Ouvrir écran"
        onPress={() => {
          navigation.push('amodule/details', { aId: 4 });
        }}
      />
    </ScrollView>
  );
}

const AModuleDetailsScreenDeclaration = defineScreen({
  options: () => ({ title: 'Écran de détails avec un nom vraiment très très long' }),
  screen: AModuleDetailsScreen,
});

const AModuleModalScreen = withSession<
  StaticScreenProps<{
    skibidi: string;
  }>
>(function ({ session }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}>
      <BodyText>A Modal Screen</BodyText>
      {/* The reaction picker (a `NativeModal`) over a modal of the navigation */}
      <Audience referer={AUDIENCE_TEST_REFERER} session={session} isManager />
      {new Array(40).fill(true).map((_, index) => (
        <HeadingSText key={index}>{index}</HeadingSText>
      ))}
    </ScrollView>
  );
});

const AModuleModalScreenDeclaration = defineModal({
  options: ({}) => ({ title: 'Une modale wow !' }),
  screen: AModuleModalScreen,
});

export default new EntModule({
  entries: {
    tab: { iconActive: 'home-fill', iconInactive: 'home-outline', order: 10, route: 'amodule/home', testId: 'tabbar-timeline' },
  },
  modals: {
    'amodule/modal': AModuleModalScreenDeclaration,
  },
  name: 'amodule',
  screens: {
    'amodule/details': AModuleDetailsScreenDeclaration,
    'amodule/home': AModuleHomeScreenDeclaration,
  },
  storages: [storage, preferences],
});
