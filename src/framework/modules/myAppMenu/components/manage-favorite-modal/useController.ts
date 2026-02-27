import * as React from 'react';
import { Alert } from 'react-native';

import { useDispatch, useSelector } from 'react-redux';

import { ManageFavoriteScreenProps } from './types';

import { I18n } from '~/app/i18n';
import { AppDispatch } from '~/app/store';
import Toast from '~/framework/components/toast';
import {
  getAllappsShowedState,
  saveGroupedFavorites,
  selectAppBookmarks,
  selectFilteredAppsWithMobile,
  selectIsSavingFavorites,
} from '~/framework/modules/myapps/reducer';

export const useManageFavoritesController = (navigation: ManageFavoriteScreenProps.ManageFavoritesNavigation['navigation']) => {
  const dispatch = useDispatch<AppDispatch>();

  const isSaving = useSelector(selectIsSavingFavorites);
  const savedBookmarks = useSelector(selectAppBookmarks).bookmarks;
  const areAppsShowed = useSelector(getAllappsShowedState);

  const allApps = useSelector(state => selectFilteredAppsWithMobile(state, { type: 'category', value: 'toutes' }, areAppsShowed));

  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const initialSelectedRef = React.useRef<Set<string>>(new Set());
  const isSavingRef = React.useRef<boolean>(false);
  const saveStartRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (isSavingRef.current) return;

    const initial = new Set(savedBookmarks);
    initialSelectedRef.current = initial;
    setSelected(initial);
  }, [savedBookmarks]);

  const filteredApps = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allApps;

    return allApps.filter(app => (app.displayName ?? app.name).toLowerCase().includes(q));
  }, [allApps, query]);

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
    isSavingRef.current = true;
    saveStartRef.current = Date.now();

    dispatch(
      saveGroupedFavorites(Array.from(selected), ok => {
        if (!ok) {
          isSavingRef.current = false;
          Toast.showError(I18n.get('myapp-add-favorite-error-message'));
        }
      }),
    );
  }, [dispatch, selected]);

  React.useEffect(() => {
    if (!isSavingRef.current || isSaving) return;

    const elapsed = Date.now() - saveStartRef.current;
    const remaining = Math.max(0, 400 - elapsed);

    setTimeout(() => {
      isSavingRef.current = false;

      navigation.goBack();

      setTimeout(() => {
        Toast.showSuccess(I18n.get('myapp-add-favorite-success-message'));
      }, 300);
    }, remaining);
  }, [isSaving, navigation]);

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
