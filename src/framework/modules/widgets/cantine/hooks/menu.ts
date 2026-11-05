import * as React from 'react';

import { Temporal } from '@js-temporal/polyfill';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '~/app/store';
import { MenuItem } from '~/framework/modules/widgets/cantine/model';
import { CantineMenuEntry, cantineMenuKey, cantineSelectors, hasLunchItems } from '~/framework/modules/widgets/cantine/store';
import { loadCantineMenuAction } from '~/framework/modules/widgets/cantine/thunks';

interface CantineMenuDisplay {
  dinnerItems?: MenuItem[];
  isError: boolean;
  isLoading: boolean;
  lunchItems: MenuItem[];
}

const MENU_LOADING: CantineMenuDisplay = { isError: false, isLoading: true, lunchItems: [] };

const getMenuToDisplay = (menuEntry?: CantineMenuEntry): CantineMenuDisplay => {
  const cachedMenu = menuEntry?.cachedMenu?.dayMenu;
  if (cachedMenu && hasLunchItems(cachedMenu)) {
    return {
      dinnerItems: cachedMenu.dinnerAvailable ? cachedMenu.dinnerMenu : undefined,
      isError: false,
      isLoading: false,
      lunchItems: cachedMenu.menu,
    };
  }
  if (!menuEntry || menuEntry.isLoading) return MENU_LOADING;
  return { isError: menuEntry.isError, isLoading: false, lunchItems: [] };
};

export function useCantineMenu(structureUai?: string, menuDate?: Temporal.PlainDate) {
  const dispatch = useDispatch<AppDispatch>();

  const displayedDay = (menuDate ?? Temporal.Now.plainDateISO()).toString();
  const menuEntry = useSelector(
    cantineSelectors.getMenuEntry(structureUai ? cantineMenuKey(structureUai, displayedDay) : undefined),
  );

  // forceRefresh fetches the menu even when the cached one is still fresh.
  const loadMenu = React.useCallback(
    async (forceRefresh?: boolean) => {
      if (structureUai) await dispatch(loadCantineMenuAction(structureUai, Temporal.PlainDate.from(displayedDay), forceRefresh));
    },
    [dispatch, displayedDay, structureUai],
  );

  const menuDisplay = React.useMemo(() => getMenuToDisplay(menuEntry), [menuEntry]);

  return { ...menuDisplay, loadMenu };
}
