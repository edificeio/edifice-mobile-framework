import * as React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { loadCarnetDeBordAction } from '~/framework/modules/widgets/carnet-de-board/actions';
import { getChildId } from '~/framework/modules/widgets/carnet-de-board/model';
import { getCarnetDeBordState } from '~/framework/modules/widgets/carnet-de-board/reducer/carnet-de-bord';

import { useSelectedChild } from './selected-child';

export function useCarnetDeBord() {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const state = useSelector(getCarnetDeBordState);
  const data = state.data;

  const { select, selected, selectedId } = useSelectedChild(data);

  const load = React.useCallback(() => dispatch(loadCarnetDeBordAction()), [dispatch]);

  const children = React.useMemo(
    () => data.map(child => ({ id: getChildId(child), name: child.firstName, userId: child.id })),
    [data],
  );

  return {
    children,
    data,
    // The reducer keeps the last error even after a later success, so it only counts while there
    // is nothing to show.
    error: data.length ? undefined : state.error,
    load,
    // A failed request leaves the state pristine, which would keep the loading on for ever.
    loading: state.isFetching || (state.isPristine && !state.error),
    select,
    selected,
    selectedId,
  };
}
