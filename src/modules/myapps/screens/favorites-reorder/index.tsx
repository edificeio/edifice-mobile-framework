/**
 * Reorder the favorites of « Mes applis » (menu « ⋯ » → « Modifier l'ordre », filter « favorites », 2 favorites or more): drag and drop,
 * then validate. The order is the one of the preferences, as the web client does.
 */
import * as React from 'react';
import { View } from 'react-native';

import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

import { defineModal, headerAction, headerRightActions } from '~/app/navigation-new';
import theme from '~/app/theme';
import AlertCard from '~/framework/components/alert';
import Feedback from '~/framework/util/feedback/feedback';
import { FavoriteReorderItem } from '~/modules/myapps/components/favorite-reorder-item/component';
import type { ListedApp } from '~/modules/myapps/model';
import { I18n } from '~/util/i18n';

import { useFavoritesOrder, useSaveFavoritesOrder } from './hooks';
import { styles } from './styles';

// The list only ends a drag once its drop spring is over. Its default spring relies on rest thresholds that
// Reanimated 4 ignores: the dropped item then stays active for seconds. This one is critically damped and
// stops as soon as the remaining movement is not visible anymore.
const DROP_ANIMATION_CONFIG = {
  damping: 16,
  energyThreshold: 1e-4,
  mass: 0.2,
  stiffness: 300,
};

// Haptic feedback: the item is lifted, passes over another item, then is dropped.
const onDragBegin = () => Feedback.longPress();
const onPlaceholderIndexChange = () => Feedback.selectionChanged();
const onRelease = () => Feedback.selectionChanged();

const renderItem = ({ drag, isActive, item }: RenderItemParams<ListedApp>) => (
  <FavoriteReorderItem app={item.app} isActive={isActive} onDrag={drag} />
);

// Keyed by app: the list reuses one placeholder for every drag, and the item keeps its icon loading state.
const renderPlaceholder = ({ item }: { item: ListedApp }) => (
  <View style={styles.placeholder}>
    <FavoriteReorderItem key={item.app.name} app={item.app} isActive={false} isPlaceholder />
  </View>
);

function MyAppsFavoritesReorderScreen({}: StaticScreenProps<undefined>) {
  const navigation = useNavigation();
  const { draftOrder, hasOrderChanged, onDragEnd, reorderCount } = useFavoritesOrder();
  const { isSaving, save } = useSaveFavoritesOrder(draftOrder, hasOrderChanged);

  // New keys after each reorder, so that the list mounts new rows. The list keeps each moved row shifted until the
  // row reports its new layout: on Android, that comes one frame after the new order is drawn, and the moved rows
  // flash at twice their offset. New rows have no offset to keep.
  const keyExtractor = React.useCallback((item: ListedApp) => `${item.app.name}-${reorderCount}`, [reorderCount]);

  // The button depends on the order, a state of the screen: set by the screen, as react-navigation advises for such buttons
  React.useLayoutEffect(() => {
    navigation.setOptions(
      headerRightActions(
        headerAction({
          disabled: !hasOrderChanged || isSaving,
          icon: { android: 'ui-check', ios: { name: 'checkmark', type: 'sfSymbol' } },
          label: I18n.get('common-save'),
          onPress: save,
          testID: 'myapps-reorder-save',
        }),
      ),
    );
  }, [hasOrderChanged, isSaving, navigation, save]);

  return (
    <View style={styles.page}>
      <AlertCard style={styles.infoCard} testID="myapps-reorder-info" text={I18n.get('myapp-reorderfavorites-info')} type="info" />
      <DraggableFlatList
        animationConfig={DROP_ANIMATION_CONFIG}
        containerStyle={styles.listContainer}
        contentContainerStyle={styles.listContent}
        data={draftOrder}
        keyExtractor={keyExtractor}
        onDragBegin={onDragBegin}
        onDragEnd={onDragEnd}
        onPlaceholderIndexChange={onPlaceholderIndexChange}
        onRelease={onRelease}
        renderItem={renderItem}
        renderPlaceholder={renderPlaceholder}
      />
    </View>
  );
}

export default defineModal({
  options: () => ({
    headerShadowVisible: false,
    headerStyle: { backgroundColor: theme.ui.background.card?.toString() },
    headerTintColor: theme.ui.text.regular?.toString(),
    statusBarStyle: 'dark',
    title: I18n.get('myapp-reorderfavorites-title'),
  }),
  screen: MyAppsFavoritesReorderScreen,
});
