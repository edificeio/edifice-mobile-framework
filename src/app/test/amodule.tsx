import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';

import { EntModule } from '~/app/module';
import { defineModal, defineScreen, sharedTransitions, StackNavigation } from '~/app/navigation-new';
import { SingleAvatar } from '~/framework/components/avatar';
import { PrimaryButton } from '~/framework/components/button';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyBoldText, BodyText, HeadingSText } from '~/framework/components/text';
import { useStorageNumber } from '~/framework/util/storage/hooks';
import { AccountsButton } from '~/modules/auth/components';
import { useAuthFlows } from '~/modules/auth/flows';
import { withSession } from '~/modules/auth/hoc';

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

// `withSession`: the hooks of an account storage work on the account of the session
const AModuleHomeScreen = withSession<
  StaticScreenProps<{
    aParam: boolean;
  }>
>(function ({ session }) {
  const navigation = useNavigation();
  const { logout } = useAuthFlows();
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
          <BodyBoldText style={{ flex: 1 }} numberOfLines={1}>
            {session.user.displayName}
          </BodyBoldText>
          <PrimaryButton
            testID="login"
            text="Se déconnecter"
            onPress={() => {
              logout();
            }}
          />
        </View>
        <View style={styles.rowCenter}>
          <AccountsButton />
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
    </ScrollView>
  );
});

const AModuleHomeScreenDeclaration = defineScreen({
  options: () => ({ title: 'Un super écran de test' }),
  screen: AModuleHomeScreen,
});

function AModuleDetailsScreen({}: StaticScreenProps<{
  aId: number;
}>) {
  const navigation = useNavigation<StackNavigation>();
  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <HeadingSText>Détails</HeadingSText>
      <View style={styles.rowCenter}>
        <Animated.Image
          source={{ uri: 'https://picsum.photos/id/39/200' }}
          style={styles.imageFull}
          sharedTransitionTag="sharedTag"
          sharedTransitionStyle={sharedTransitions.default}
        />
      </View>
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
  options: ({
    route: {
      params: { aId },
    },
  }) => ({ title: 'Écran de détails avec un nom vraiment très très long' }),
  screen: AModuleDetailsScreen,
});

function AModuleModalScreen({}: StaticScreenProps<{
  skibidi: string;
}>) {
  return (
    <ScrollView>
      <BodyText>A Modal Screen</BodyText>
      {new Array(20).fill(true).map((_, index) => (
        <BodyText key={index}>{index}</BodyText>
      ))}
    </ScrollView>
  );
}

const AModuleModalScreenDeclaration = defineModal({
  options: ({}) => ({ title: 'SALUT' }),
  screen: AModuleModalScreen,
});

export default new EntModule({
  modals: {
    'amodule/modal': AModuleModalScreenDeclaration,
  },
  name: 'amodule',
  screens: {
    'amodule/details': AModuleDetailsScreenDeclaration,
    'amodule/home': AModuleHomeScreenDeclaration,
  },
  storages: [storage, preferences],
  tab: { iconActive: 'ui-camera', iconInactive: 'ui-anniversary', order: 1, route: 'amodule/home', testId: 'a' },
});
