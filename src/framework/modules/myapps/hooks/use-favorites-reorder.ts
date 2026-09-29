import React from 'react';

import type { DragEndParams } from 'react-native-draggable-flatlist';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch } from '~/app/store';
import Toast from '~/framework/components/toast';
import { saveGroupedFavorites } from '~/framework/modules/myapps/reducer/actions';
import { mergeReorderedBookmarks } from '~/framework/modules/myapps/reducer/adapter';
import { selectAppBookmarks } from '~/framework/modules/myapps/reducer/selectors';
import { AppsInfoAggregated, MyAppsFilter, MyAppsFilterTypes } from '~/framework/modules/myapps/types';
import { I18n } from '~/util/i18n';

import { useFilteredApps } from './use-filtered-apps';

const FAVORITES_FILTER: MyAppsFilter = { type: MyAppsFilterTypes.Favorites };

export const useFavoritesReorder = (onOrderSaved: () => void) => {
  const dispatch = useDispatch<AppDispatch>();

  const { bookmarks } = useSelector(selectAppBookmarks);
  const savedOrder = useFilteredApps(FAVORITES_FILTER);

  const [draftOrder, setDraftOrder] = React.useState<AppsInfoAggregated[]>(savedOrder);
  const [isSaving, setIsSaving] = React.useState(false);
  const [reorderCount, setReorderCount] = React.useState(0);

  const hasSavedOrderRef = React.useRef(false);

  const hasOrderChanged = draftOrder.some((app, index) => app.name !== savedOrder[index]?.name);

  // A modal hosts its own toast container: shown before the modal is removed, the toast would disappear with it.
  React.useEffect(
    () => () => {
      if (hasSavedOrderRef.current) Toast.showSuccess(I18n.get('myapp-add-favorite-success-message'));
    },
    [],
  );

  const onDragEnd = React.useCallback(({ data, from, to }: DragEndParams<AppsInfoAggregated>) => {
    setDraftOrder(data);
    if (from !== to) setReorderCount(count => count + 1);
  }, []);

  const onSave = React.useCallback(() => {
    const orderedNames = draftOrder.map(app => app.name);

    setIsSaving(true);
    dispatch(
      saveGroupedFavorites(mergeReorderedBookmarks(orderedNames, bookmarks ?? []), isSaved => {
        setIsSaving(false);
        if (!isSaved) {
          Toast.showError(I18n.get('myapp-add-favorite-error-message'));
          return;
        }
        hasSavedOrderRef.current = true;
        onOrderSaved();
      }),
    );
  }, [bookmarks, dispatch, draftOrder, onOrderSaved]);

  return { draftOrder, hasOrderChanged, isSaving, onDragEnd, onSave, reorderCount };
};
