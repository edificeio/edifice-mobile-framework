import * as React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { loadCarnetDeBordAction } from '~/framework/modules/widgets/carnet-de-board/actions/carnet-de-bord';
import { useSelectedChild } from '~/framework/modules/widgets/carnet-de-board/hooks/selected-child';
import { getChildId } from '~/framework/modules/widgets/carnet-de-board/model/child';
import { getCarnetDeBordState } from '~/framework/modules/widgets/carnet-de-board/reducer/carnet-de-bord';

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
    error: state.error,
    load,
    loading: state.isPristine || state.isFetching,
    select,
    selected,
    selectedId,
  };
}
