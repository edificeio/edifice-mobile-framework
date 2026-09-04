import * as React from 'react';

import { useFocusEffect } from '@react-navigation/native';

import { CarnetDeBordChild, findChild, getChildId } from '~/framework/modules/widgets/carnet-de-board/model/child';
import { preferences } from '~/framework/modules/widgets/carnet-de-board/storage';

const SELECTED_CHILD = 'carnet-de-bord.selected-user';

const readSavedId = () => preferences.getString(SELECTED_CHILD) ?? undefined;

/**
 * Which child is being looked at, kept from one visit to the next. The saved one may have left the
 * account since, so the first of the list takes over.
 */
export function useSelectedChild<T extends Pick<CarnetDeBordChild, 'id' | 'idPronote'>>(children: T[]) {
  const [savedId, setSavedId] = React.useState<string | undefined>(readSavedId);

  // The widget and the full screen each hold their own state over one saved value, so whoever comes
  // back reads again what the other one may have picked meanwhile.
  useFocusEffect(
    React.useCallback(() => {
      setSavedId(readSavedId());
    }, []),
  );

  const select = React.useCallback((id: string) => {
    setSavedId(id);
    preferences.set(SELECTED_CHILD, id);
  }, []);

  const selected = React.useMemo(() => findChild(children, savedId) ?? children.at(0), [children, savedId]);

  return { select, selected, selectedId: selected ? getChildId(selected) : undefined };
}
