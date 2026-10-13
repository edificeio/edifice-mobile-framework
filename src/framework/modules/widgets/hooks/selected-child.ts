import * as React from 'react';

import { useFocusEffect } from '@react-navigation/native';

import { findChild, WidgetChild } from '~/framework/modules/widgets/model';

export interface SelectedChildStorage {
  read: () => string | undefined;
  write: (id: string) => void;
}

/**
 * The child a widget is about, remembered from one launch to the next. Each widget keeps its own
 * choice: the selectors do not follow one another.
 *
 * The storage is passed in rather than read here, so that every module keeps its own typed
 * preferences.
 */
export function useSelectedChild<T extends WidgetChild>(children: T[], storage: SelectedChildStorage) {
  const [savedId, setSavedId] = React.useState<string | undefined>(storage.read);

  useFocusEffect(
    React.useCallback(() => {
      setSavedId(storage.read());
    }, [storage]),
  );

  const select = React.useCallback(
    (id: string) => {
      setSavedId(id);
      storage.write(id);
    },
    [storage],
  );

  const selected = React.useMemo(() => findChild(children, savedId) ?? children.at(0), [children, savedId]);

  return { select, selected };
}
