import * as React from 'react';
import { Alert } from 'react-native';

import { useDispatch, useSelector } from 'react-redux';

import { ManageFavoriteScreenProps } from './types';

import { I18n } from '~/app/i18n';
import { AppDispatch } from '~/app/store';
import Toast from '~/framework/components/toast';
import { useFilteredApps } from '~/framework/modules/myapps/hooks';
import { saveGroupedFavorites, selectAppBookmarks } from '~/framework/modules/myapps/reducer';
import { MyAppsFilterCategories, MyAppsFilterTypes } from '~/framework/modules/myapps/types';
import { normalizeString } from '~/framework/modules/myapps/utils';

export const useManageFavoritesController = (navigation: ManageFavoriteScreenProps.ManageFavoritesNavigation['navigation']) => {
  const dispatch = useDispatch<AppDispatch>();

  const savedBookmarks = useSelector(selectAppBookmarks).bookmarks;

  const [isSaving, setIsSaving] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const initialSelectedRef = React.useRef<Set<string>>(new Set());

  const filter = React.useMemo(() => ({ type: MyAppsFilterTypes.Category, value: MyAppsFilterCategories.all }) as const, []);
  const allApps = useFilteredApps(filter);

  React.useEffect(() => {
    const initial = new Set(savedBookmarks);
    initialSelectedRef.current = initial;
    setSelected(initial);
  }, [savedBookmarks]);

  const filteredApps = React.useMemo(() => {
    const q = query.trim();
    if (!q) return allApps;

    const normalizedQuery = normalizeString(q);
    return allApps.filter(app => normalizeString(app.displayName).includes(normalizedQuery));
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
    setIsSaving(true);

    dispatch(
      saveGroupedFavorites(Array.from(selected), ok => {
        if (!ok) {
          setIsSaving(false);
          Toast.showError(I18n.get('myapp-add-favorite-error-message'));
          return;
        }

        setTimeout(() => {
          setIsSaving(false);
          navigation.goBack();

          setTimeout(() => {
            Toast.showSuccess(I18n.get('myapp-add-favorite-success-message'));
          }, 300);
        }, 400);
      }),
    );
  }, [dispatch, selected, navigation]);

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
