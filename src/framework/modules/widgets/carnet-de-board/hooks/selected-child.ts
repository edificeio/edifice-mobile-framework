import * as React from 'react';

import { useFocusEffect } from '@react-navigation/native';

import { CarnetDeBordChild, findChild, getChildId } from '~/framework/modules/widgets/carnet-de-board/model';
import { preferences } from '~/framework/modules/widgets/carnet-de-board/storage';

const readSavedId = () => preferences.getString('carnet-de-bord.selected-user') ?? undefined;

export function useSelectedChild<T extends Pick<CarnetDeBordChild, 'id' | 'idPronote'>>(children: T[]) {
  const [savedId, setSavedId] = React.useState<string | undefined>(readSavedId);

  useFocusEffect(
    React.useCallback(() => {
      setSavedId(readSavedId());
    }, []),
  );

  const select = React.useCallback((id: string) => {
    setSavedId(id);
    preferences.set('carnet-de-bord.selected-user', id);
  }, []);

  const selected = React.useMemo(() => findChild(children, savedId) ?? children.at(0), [children, savedId]);

  return { select, selected, selectedId: selected ? getChildId(selected) : undefined };
}
