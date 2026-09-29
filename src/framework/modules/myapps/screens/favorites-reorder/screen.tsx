import * as React from 'react';
import { View } from 'react-native';

import type { NativeStackHeaderItemProps } from '@react-navigation/native-stack';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

import { headerAction, modalScreenOptions } from '~/app/navigation/util';
import { useConfirmRemove } from '~/app/navigation-new/confirm-remove';
import theme from '~/app/theme';
import AlertCard from '~/framework/components/alert';
import FavoriteReorderItem from '~/framework/modules/myapps/components/favorite-reorder-item';
import { useFavoritesReorder } from '~/framework/modules/myapps/hooks/use-favorites-reorder';
import type { AppsInfoAggregated } from '~/framework/modules/myapps/types';
import Feedback from '~/framework/util/feedback/feedback';
import { I18n } from '~/util/i18n';

import { styles } from './styles';
import type { MyAppsFavoritesReorderScreen } from './types';

export const computeNavBar = modalScreenOptions('modal', () => ({
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: theme.palette.grey.white.toString(),
  },
  headerTintColor: theme.palette.grey.black.toString(),
  statusBarStyle: 'dark',
  title: I18n.get('myapp-reorderfavorites-title'),
}));

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

const renderItem = ({ drag, isActive, item }: RenderItemParams<AppsInfoAggregated>) => (
  <FavoriteReorderItem app={item} isActive={isActive} onDrag={drag} />
);

// Keyed by app: the list reuses one placeholder for every drag, and the item keeps its icon loading state.
const renderPlaceholder = ({ item }: { item: AppsInfoAggregated }) => (
  <View style={styles.placeholder}>
    <FavoriteReorderItem key={item.name} app={item} isActive={false} isPlaceholder />
  </View>
);

const FavoritesReorderScreen = ({ navigation }: MyAppsFavoritesReorderScreen.AllProps) => {
  // The user may already have left the screen while the order was being saved.
  const closeIfStillOpen = React.useCallback(() => {
    if (navigation.isFocused()) navigation.goBack();
  }, [navigation]);

  const { draftOrder, hasOrderChanged, isSaving, onDragEnd, onSave, reorderCount } = useFavoritesReorder(closeIfStillOpen);

  // New keys after each reorder, so that the list mounts new rows. The list keeps each moved row shifted until the
  // row reports its new layout: on Android, that comes one frame after the new order is drawn, and the moved rows
  // flash at twice their offset. New rows have no offset to keep.
  const keyExtractor = React.useCallback((app: AppsInfoAggregated) => `${app.name}-${reorderCount}`, [reorderCount]);

  useConfirmRemove(hasOrderChanged, {
    text: I18n.get('myapp-reorderfavorites-abort-message'),
    title: I18n.get('myapp-add-favorite-abort-title'),
  });

  const isSaveDisabled = !hasOrderChanged || isSaving;

  React.useLayoutEffect(() => {
    const getSaveAction = (props: NativeStackHeaderItemProps) =>
      headerAction({ disabled: isSaveDisabled, icon: 'ui-check', onPress: onSave, testID: 'myapps-reorder-save' }, props);

    navigation.setOptions({
      headerRight: props => getSaveAction(props).element,
      unstable_headerRightItems: props => [getSaveAction(props)],
    });
  }, [isSaveDisabled, navigation, onSave]);

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
};

export default FavoritesReorderScreen;
