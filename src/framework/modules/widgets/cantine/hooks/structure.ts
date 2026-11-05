import * as React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '~/app/store';
import { UserStructureWithClasses } from '~/framework/modules/auth/model';
import { cantineSelectors } from '~/framework/modules/widgets/cantine/store';
import { restoreCantineStructureAction, selectCantineStructureAction } from '~/framework/modules/widgets/cantine/thunks';

const NO_STRUCTURES: UserStructureWithClasses[] = [];

/**
 * structure selected for the menu, shared by the home widget and menu screen.
 * defaults to the first structure if none valid is saved.
 */
export function useCantineStructure(structures: UserStructureWithClasses[] = NO_STRUCTURES) {
  const dispatch = useDispatch<AppDispatch>();
  const isStructureRestored = useSelector(cantineSelectors.isStructureRestored);
  const selectedStructureUai = useSelector(cantineSelectors.getSelectedStructureUai);

  // restored before the first paint, so the first structure never shows up in place of the saved one.
  React.useLayoutEffect(() => {
    if (!isStructureRestored) dispatch(restoreCantineStructureAction());
  }, [dispatch, isStructureRestored]);

  const select = React.useCallback((uai: string) => dispatch(selectCantineStructureAction(uai)), [dispatch]);

  const structure = React.useMemo(() => {
    if (!isStructureRestored) return undefined;
    return structures.find(item => item.UAI === selectedStructureUai) ?? structures[0];
  }, [isStructureRestored, selectedStructureUai, structures]);

  return { select, structure };
}
