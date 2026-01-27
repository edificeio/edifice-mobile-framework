import * as React from 'react';
import { Alert } from 'react-native';

import { ManageFavoriteScreenProps } from './types';

import { I18n } from '~/app/i18n';
import { AppDispatch, getStore } from '~/app/store';
import {
  getAllappsShowedState,
  saveGroupedFavorites,
  selectAppBookmarks,
  selectFilteredAppsWithMobile,
  selectIsSavingFavorites,
} from '~/framework/modules/myapps/reducer';
import { AppsInfoAggregated } from '~/framework/modules/myapps/types';

export const useManageFavoritesController = (navigation: ManageFavoriteScreenProps.ManageFavoritesNavigation['navigation']) => {
  const store = getStore();
  const appState = store.getState();
  const dispatch = store.dispatch as AppDispatch;

  const isSaving = selectIsSavingFavorites(appState);
  const savedBookmarks = selectAppBookmarks(appState).bookmarks;
  const areAppsShowed = getAllappsShowedState(appState);

  const [query, setQuery] = React.useState('');
  const [apps, setApps] = React.useState<AppsInfoAggregated[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const initialSelectedRef = React.useRef<Set<string>>(new Set());

  const filteredApps = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter(app => (app.displayName ?? app.name).toLowerCase().includes(q));
  }, [apps, query]);

  const displayApps = React.useMemo(
    () =>
      filteredApps.map(app => ({
        ...app,
        isFavorite: selected.has(app.name),
      })),
    [filteredApps, selected],
  );

  const onToggle = React.useCallback((appName: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(appName) ? next.delete(appName) : next.add(appName);
      return next;
    });
  }, []);

  const onValidate = React.useCallback(() => {
    dispatch(saveGroupedFavorites(Array.from(selected)));
  }, [dispatch, selected]);

  const hasUnsavedChanges = React.useMemo(() => {
    const initial = initialSelectedRef.current;
    if (initial.size !== selected.size) return true;
    for (const key of selected) {
      if (!initial.has(key)) return true;
    }
    return false;
  }, [selected]);

  const handleGoBack = React.useCallback(() => {
    if (!hasUnsavedChanges) {
      navigation.goBack();
      return;
    }

    Alert.alert(I18n.get('myapp-add-favorite-abort-title'), I18n.get('myapp-add-favorite-abort-message'), [
      { style: 'cancel', text: I18n.get('common-cancel') },
      {
        onPress: () => navigation.goBack(),
        style: 'destructive',
        text: I18n.get('common-quit'),
      },
    ]);
  }, [hasUnsavedChanges, navigation]);

  React.useEffect(() => {
    const init = () => {
      const state = store.getState();
      const bookmarks = selectAppBookmarks(state).bookmarks;

      const initial = new Set(bookmarks);
      initialSelectedRef.current = initial;
      setSelected(initial);

      const aggregated = selectFilteredAppsWithMobile(state, { type: 'category', value: 'toutes' }, areAppsShowed);
      setApps(aggregated);
    };

    init();
    const unsub = store.subscribe(init);
    return unsub;
  }, [store, areAppsShowed]);

  React.useEffect(() => {
    if (isSaving) return;

    const saved = new Set(savedBookmarks);

    let equals = saved.size === selected.size;
    if (equals) {
      for (const key of saved) {
        if (!selected.has(key)) {
          equals = false;
          break;
        }
      }
    }

    if (equals) {
      initialSelectedRef.current = new Set(saved);
    }
  }, [savedBookmarks, selected, isSaving]);

  return {
    displayApps,
    filteredApps,
    handleGoBack,
    hasUnsavedChanges,
    isSaving,
    onToggle,
    onValidate,
    query,
    selected,
    setQuery,
  };
};
