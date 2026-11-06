import { IGlobalState } from '~/app/store';
import { CantineData } from '~/framework/modules/widgets/cantine/model';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

import moduleConfig from './module-config';

const MENU_FRESH_DURATION_MS = 24 * 60 * 60 * 1000;
const MAX_CACHED_MENUS = 50;

/**
 * a day is empty if it has no lunch items, even if dinner is available.
 * empty days and errors are not cached, so they are fetched again on the next visit.
 */
const hasLunchItems = (dayMenu?: CantineData) => (dayMenu?.menu?.length ?? 0) > 0;

export const cantineMenuKey = (structureUai: string, day: string) => `${structureUai}|${day}`;

export interface CantineMenuEntry {
  cachedMenu?: { dayMenu: CantineData; fetchedAt: number };
  isError: boolean;
  isLoading: boolean;
}

export const isMenuFresh = (menuEntry?: CantineMenuEntry) =>
  !!menuEntry?.cachedMenu && Date.now() - menuEntry.cachedMenu.fetchedAt < MENU_FRESH_DURATION_MS;

export interface CantineStore {
  isStructureRestored: boolean;
  menuEntries: Record<string, CantineMenuEntry>;
  selectedStructureUai?: string;
}

export const cantineActionTypes = {
  LOAD_MENU_EMPTY: moduleConfig.namespaceActionType('LOAD_MENU_EMPTY') as `${string}_LOAD_MENU_EMPTY`,
  LOAD_MENU_FAILURE: moduleConfig.namespaceActionType('LOAD_MENU_FAILURE') as `${string}_LOAD_MENU_FAILURE`,
  LOAD_MENU_REQUEST: moduleConfig.namespaceActionType('LOAD_MENU_REQUEST') as `${string}_LOAD_MENU_REQUEST`,
  LOAD_MENU_SUCCESS: moduleConfig.namespaceActionType('LOAD_MENU_SUCCESS') as `${string}_LOAD_MENU_SUCCESS`,
  SELECT_STRUCTURE: moduleConfig.namespaceActionType('SELECT_STRUCTURE') as `${string}_SELECT_STRUCTURE`,
};

type CantineAction =
  | { type: typeof cantineActionTypes.LOAD_MENU_REQUEST; payload: { menuKey: string } }
  | { type: typeof cantineActionTypes.LOAD_MENU_SUCCESS; payload: { dayMenu: CantineData; fetchedAt: number; menuKey: string } }
  | { type: typeof cantineActionTypes.LOAD_MENU_EMPTY; payload: { menuKey: string } }
  | { type: typeof cantineActionTypes.LOAD_MENU_FAILURE; payload: { menuKey: string } }
  | { type: typeof cantineActionTypes.SELECT_STRUCTURE; payload: { structureUai?: string } };

type ActionOf<T extends CantineAction['type']> = Extract<CantineAction, { type: T }>;

const IDLE_MENU_ENTRY: CantineMenuEntry = { isError: false, isLoading: false };

const setMenuEntry = (state: CantineStore, menuKey: string, menuEntry: CantineMenuEntry): CantineStore => ({
  ...state,
  menuEntries: { ...state.menuEntries, [menuKey]: menuEntry },
});

// an empty or failed reload must not erase the menu already displayed.
const endMenuLoading = (state: CantineStore, menuKey: string, { hasFailed = false } = {}): CantineStore => {
  const { cachedMenu } = state.menuEntries[menuKey] ?? IDLE_MENU_ENTRY;
  return setMenuEntry(state, menuKey, { cachedMenu, isError: hasFailed && !cachedMenu, isLoading: false });
};

const keepCachedMenusUnderAllowedLimit = (menuEntries: CantineStore['menuEntries']) => {
  // do not remove menus while they are being reloaded.
  const removableMenus = Object.entries(menuEntries).flatMap(([menuKey, menuEntry]) =>
    menuEntry.cachedMenu && !menuEntry.isLoading ? [{ fetchedAt: menuEntry.cachedMenu.fetchedAt, menuKey }] : [],
  );
  if (removableMenus.length <= MAX_CACHED_MENUS) return menuEntries;
  const oldestMenu = removableMenus.reduce(
    (oldest, removableMenu) => (removableMenu.fetchedAt < oldest.fetchedAt ? removableMenu : oldest),
    removableMenus[0],
  );
  const trimmedMenuEntries = { ...menuEntries };
  delete trimmedMenuEntries[oldestMenu.menuKey];
  return trimmedMenuEntries;
};

export const reducer = createSessionReducer<CantineStore, CantineAction>(
  { isStructureRestored: false, menuEntries: {} },
  {
    [cantineActionTypes.LOAD_MENU_REQUEST]: (state, action) => {
      const { menuKey } = (action as ActionOf<typeof cantineActionTypes.LOAD_MENU_REQUEST>).payload;
      const menuEntry = state.menuEntries[menuKey] ?? IDLE_MENU_ENTRY;
      return setMenuEntry(state, menuKey, { ...menuEntry, isError: false, isLoading: true });
    },
    [cantineActionTypes.LOAD_MENU_SUCCESS]: (state, action) => {
      const { dayMenu, fetchedAt, menuKey } = (action as ActionOf<typeof cantineActionTypes.LOAD_MENU_SUCCESS>).payload;
      if (!hasLunchItems(dayMenu)) return endMenuLoading(state, menuKey);
      const nextState = setMenuEntry(state, menuKey, { cachedMenu: { dayMenu, fetchedAt }, isError: false, isLoading: false });
      return { ...nextState, menuEntries: keepCachedMenusUnderAllowedLimit(nextState.menuEntries) };
    },
    // a 400 means no menu available, not a request failure.
    [cantineActionTypes.LOAD_MENU_EMPTY]: (state, action) => {
      const { menuKey } = (action as ActionOf<typeof cantineActionTypes.LOAD_MENU_EMPTY>).payload;
      return endMenuLoading(state, menuKey);
    },
    [cantineActionTypes.LOAD_MENU_FAILURE]: (state, action) => {
      const { menuKey } = (action as ActionOf<typeof cantineActionTypes.LOAD_MENU_FAILURE>).payload;
      return endMenuLoading(state, menuKey, { hasFailed: true });
    },
    [cantineActionTypes.SELECT_STRUCTURE]: (state, action) => ({
      ...state,
      isStructureRestored: true,
      selectedStructureUai: (action as ActionOf<typeof cantineActionTypes.SELECT_STRUCTURE>).payload.structureUai,
    }),
  },
);

export const cantineActions = {
  loadMenuEmpty: (menuKey: string) => ({ payload: { menuKey }, type: cantineActionTypes.LOAD_MENU_EMPTY }),
  loadMenuFailure: (menuKey: string) => ({ payload: { menuKey }, type: cantineActionTypes.LOAD_MENU_FAILURE }),
  loadMenuRequest: (menuKey: string) => ({ payload: { menuKey }, type: cantineActionTypes.LOAD_MENU_REQUEST }),
  loadMenuSuccess: (menuKey: string, dayMenu: CantineData, fetchedAt: number) => ({
    payload: { dayMenu, fetchedAt, menuKey },
    type: cantineActionTypes.LOAD_MENU_SUCCESS,
  }),
  selectStructure: (structureUai?: string) => ({ payload: { structureUai }, type: cantineActionTypes.SELECT_STRUCTURE }),
};

export const cantineSelectors = {
  getMenuEntry: (menuKey?: string) => (state: IGlobalState) =>
    menuKey ? moduleConfig.getState(state).menuEntries[menuKey] : undefined,
  getSelectedStructureUai: (state: IGlobalState) => moduleConfig.getState(state).selectedStructureUai,
  isStructureRestored: (state: IGlobalState) => moduleConfig.getState(state).isStructureRestored,
};
