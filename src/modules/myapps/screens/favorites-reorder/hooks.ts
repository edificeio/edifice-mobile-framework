import * as React from 'react';

import { useNavigation } from '@react-navigation/native';
import type { DragEndParams } from 'react-native-draggable-flatlist';

import { useConfirmRemove } from '~/app/navigation-new';
import Toast from '~/framework/components/toast';
import type { AuthActiveAccount } from '~/modules/auth/model';
import { useFavorites, useFilteredApps } from '~/modules/myapps/hooks';
import type { ListedApp, MyAppsFilter } from '~/modules/myapps/model';
import { I18n } from '~/util/i18n';

const FAVORITES_FILTER: MyAppsFilter = { type: 'favorites' };

/**
 * The favorites in the order being chosen, from their saved order (the one of the filter « favorites »). `reorderCount` counts the
 * moves: the screen gives new keys to the rows after each one.
 */
export const useFavoritesOrder = () => {
  const savedOrder = useFilteredApps(FAVORITES_FILTER);
  const [draftOrder, setDraftOrder] = React.useState<ListedApp[]>(savedOrder);
  const [reorderCount, setReorderCount] = React.useState(0);

  /** Compared to the saved order: once saved, nothing is left to save. */
  const hasOrderChanged = draftOrder.some((item, index) => item.app.name !== savedOrder[index]?.app.name);

  const onDragEnd = React.useCallback(({ data, from, to }: DragEndParams<ListedApp>) => {
    setDraftOrder(data);
    if (from !== to) setReorderCount(count => count + 1);
  }, []);

  return { draftOrder, hasOrderChanged, onDragEnd, reorderCount };
};

/**
 * Saves the order, then closes the modal: only once saved, as the modal of the favorites. Closing the modal with an unsaved order, by
 * its button or by a gesture, asks for a confirmation first.
 */
export const useSaveFavoritesOrder = (session: AuthActiveAccount, draftOrder: ListedApp[], hasOrderChanged: boolean) => {
  const navigation = useNavigation();
  const { reorder } = useFavorites();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  useConfirmRemove(hasOrderChanged && !isSaved, {
    text: I18n.get('myapp-reorderfavorites-abort-message'),
    title: I18n.get('myapp-add-favorite-abort-title'),
  });

  // Closed once the confirmation no longer applies (rendered with `isSaved`)
  React.useEffect(() => {
    if (!isSaved) return;
    navigation.goBack();
    Toast.showSuccess(I18n.get('myapp-add-favorite-success-message'));
  }, [isSaved, navigation]);

  const save = React.useCallback(async () => {
    const orderedNames = draftOrder.map(item => item.app.name);
    setIsSaving(true);
    try {
      await reorder(session, orderedNames);
      setIsSaved(true);
    } catch (e) {
      console.error('[MyApps] Failed to save the order of the favorites', e);
      Toast.showError(I18n.get('myapp-add-favorite-error-message'));
      setIsSaving(false);
    }
  }, [draftOrder, reorder, session]);

  return { isSaving, save };
};
