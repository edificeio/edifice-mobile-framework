import * as React from 'react';

import { useNavigation } from '@react-navigation/native';

import { useConfirmRemove } from '~/app/navigation-new';
import Toast from '~/framework/components/toast';
import { useFavorites, useFilteredApps } from '~/modules/myapps/hooks';
import type { ListedApp, MyAppsFilter } from '~/modules/myapps/model';
import { normalizeString } from '~/modules/myapps/util';
import { I18n } from '~/util/i18n';

const ALL_APPS_FILTER: MyAppsFilter = { type: 'all' };

const isSameSelection = (a: ReadonlySet<string>, b: ReadonlySet<string>) => a.size === b.size && [...a].every(name => b.has(name));

/**
 * The favorites being chosen: all the apps of the filter « all » (as the switch « show all the apps » shows them), searched by label,
 * each one shown as a favorite if it is selected. The selection starts from the saved favorites, in their order: the ones added go at
 * the end.
 */
export const useFavoritesSelection = () => {
  const { favorites } = useFavorites();
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(() => new Set(favorites));
  const [query, setQuery] = React.useState('');
  const allApps = useFilteredApps(ALL_APPS_FILTER);

  const apps = React.useMemo<ListedApp[]>(() => {
    const normalizedQuery = normalizeString(query.trim());
    return allApps
      .filter(({ app }) => !normalizedQuery || normalizeString(app.label).includes(normalizedQuery))
      .map(item => ({ ...item, isFavorite: selected.has(item.app.name) }));
  }, [allApps, query, selected]);

  const toggle = React.useCallback((appName: string) => {
    setSelected(previous => {
      const next = new Set(previous);
      if (!next.delete(appName)) next.add(appName);
      return next;
    });
  }, []);

  /** Compared to the saved favorites: once saved, nothing is left to save. */
  const hasUnsavedChanges = !isSameSelection(selected, favorites);

  return { apps, hasUnsavedChanges, query, selected, setQuery, toggle };
};

/**
 * Saves the selection, then closes the modal: only once saved (§4 n° 6), with no delay (§4 n° 7). Closing the modal with unsaved
 * changes, by its button or by a gesture, asks for a confirmation first (§4 n° 11).
 */
export const useSaveFavorites = (selected: ReadonlySet<string>, hasUnsavedChanges: boolean) => {
  const navigation = useNavigation();
  const { save } = useFavorites();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  useConfirmRemove(hasUnsavedChanges && !isSaved, {
    text: I18n.get('myapp-add-favorite-abort-message'),
    title: I18n.get('myapp-add-favorite-abort-title'),
  });

  // Closed once the confirmation no longer applies (rendered with `isSaved`)
  React.useEffect(() => {
    if (!isSaved) return;
    navigation.goBack();
    Toast.showSuccess(I18n.get('myapp-add-favorite-success-message'));
  }, [isSaved, navigation]);

  const validate = React.useCallback(async () => {
    setIsSaving(true);
    try {
      await save([...selected]);
      setIsSaved(true);
    } catch (e) {
      console.error('[MyApps] Failed to save the favorites', e);
      Toast.showError(I18n.get('myapp-add-favorite-error-message'));
      setIsSaving(false);
    }
  }, [save, selected]);

  return { isSaving, validate };
};
