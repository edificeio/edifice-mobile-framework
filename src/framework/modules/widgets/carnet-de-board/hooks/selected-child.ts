import * as React from 'react';

import { useFocusEffect } from '@react-navigation/native';

import { CarnetDeBordChild, findChild, getChildId } from '~/framework/modules/widgets/carnet-de-board/model';
import { preferences } from '~/framework/modules/widgets/carnet-de-board/storage';

const SELECTED_CHILD = 'carnet-de-bord.selected-user';

const readSavedId = () => preferences.getString(SELECTED_CHILD) ?? undefined;

export function useSelectedChild<T extends Pick<CarnetDeBordChild, 'id' | 'idPronote'>>(children: T[]) {
  const [savedId, setSavedId] = React.useState<string | undefined>(readSavedId);

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
