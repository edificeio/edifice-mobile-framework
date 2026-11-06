import * as React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '~/app/store';
import { UserStructureWithClasses } from '~/framework/modules/auth/model';
import { cantineSelectors } from '~/framework/modules/widgets/cantine/store';
import { restoreCantineStructureAction, selectCantineStructureAction } from '~/framework/modules/widgets/cantine/thunks';

const NO_STRUCTURES: UserStructureWithClasses[] = [];

const hasUai = (structure: UserStructureWithClasses) => !!structure.UAI;

/**
 * structure selected for the menu, shared by the home widget and menu screen.
 * only structures with a UAI are displayed;
 * defaults to the first of them if none valid is saved.
 */
export function useCantineStructure(structures: UserStructureWithClasses[] = NO_STRUCTURES) {
  const dispatch = useDispatch<AppDispatch>();
  const isStructureRestored = useSelector(cantineSelectors.isStructureRestored);
  const selectedStructureUai = useSelector(cantineSelectors.getSelectedStructureUai);

  // restored before the first paint, so the first structure never shows up in place of the saved one.
  React.useLayoutEffect(() => {
    if (!isStructureRestored) dispatch(restoreCantineStructureAction());
  }, [dispatch, isStructureRestored]);

  const cantineStructures = React.useMemo(() => structures.filter(hasUai), [structures]);

  const select = React.useCallback((uai: string) => dispatch(selectCantineStructureAction(uai)), [dispatch]);

  const structure = React.useMemo(() => {
    if (!isStructureRestored) return undefined;
    return cantineStructures.find(item => item.UAI === selectedStructureUai) ?? cantineStructures[0];
  }, [cantineStructures, isStructureRestored, selectedStructureUai]);

  return { cantineStructures, select, structure };
}
