import * as React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { loadCarnetDeBordAction } from '~/framework/modules/widgets/carnet-de-board/actions/carnet-de-bord';
import { getCarnetDeBordState } from '~/framework/modules/widgets/carnet-de-board/reducer/carnet-de-bord';
import { preferences } from '~/framework/modules/widgets/carnet-de-board/storage';

const SELECTED_USER = 'carnet-de-bord.selected-user';

/**
 * The backend answers one entry per child and per structure, so a child with two Pronote accounts
 * appears twice. Their Pronote identifier is what tells them apart.
 */
const getChildId = (data: { id: string; idPronote?: string }) => data.idPronote ?? data.id;

export function useCarnetDeBord() {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const state = useSelector(getCarnetDeBordState);
  const data = state.data;

  const [selectedId, setSelectedId] = React.useState<string | undefined>(() => preferences.getString(SELECTED_USER) ?? undefined);

  const load = React.useCallback(() => dispatch(loadCarnetDeBordAction()), [dispatch]);

  const children = React.useMemo(
    () => data.map(child => ({ id: getChildId(child), name: child.firstName, userId: child.id })),
    [data],
  );

  // The saved child may have left the account since, so the first one takes over.
  const selected = React.useMemo(() => data.find(child => getChildId(child) === selectedId) ?? data.at(0), [data, selectedId]);

  const select = React.useCallback((id: string) => {
    setSelectedId(id);
    preferences.set(SELECTED_USER, id);
  }, []);

  return {
    children,
    error: state.error,
    load,
    loading: state.isPristine || state.isFetching,
    select,
    selected,
    selectedId: selected ? getChildId(selected) : undefined,
  };
}
