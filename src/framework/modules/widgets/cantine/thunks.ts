import { Temporal } from '@js-temporal/polyfill';
import { UnknownAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import { cantineService } from '~/framework/modules/widgets/cantine/service';
import { selectedStructureStorage } from '~/framework/modules/widgets/cantine/storage';
import { cantineActions, cantineMenuKey, cantineSelectors, isMenuFresh } from '~/framework/modules/widgets/cantine/store';
import { HTTPError } from '~/framework/util/transport/error';

type CantineThunk = ThunkAction<Promise<void> | void, IGlobalState, unknown, UnknownAction>;

// treat a 400 response as an empty menu.
const isMissingMenu = (error: unknown) => error instanceof HTTPError && error.status === 400;

export const loadCantineMenuAction =
  (structureUai: string, date: Temporal.PlainDate, forceRefresh: boolean = false): CantineThunk =>
  async (dispatch, getState) => {
    const menuKey = cantineMenuKey(structureUai, date.toString());
    const menuEntry = cantineSelectors.getMenuEntry(menuKey)(getState());
    // skip if the same request is pending, or if the cached menu is fresh and no refresh is forced.
    if (menuEntry?.isLoading || (!forceRefresh && isMenuFresh(menuEntry))) return;

    dispatch(cantineActions.loadMenuRequest(menuKey));
    try {
      const dayMenu = await cantineService.menu(structureUai, date);
      dispatch(cantineActions.loadMenuSuccess(menuKey, dayMenu, Date.now()));
    } catch (error) {
      dispatch(isMissingMenu(error) ? cantineActions.loadMenuEmpty(menuKey) : cantineActions.loadMenuFailure(menuKey));
    }
  };

export const selectCantineStructureAction =
  (structureUai: string): CantineThunk =>
  dispatch => {
    selectedStructureStorage.write(structureUai);
    dispatch(cantineActions.selectStructure(structureUai));
  };

export const restoreCantineStructureAction = (): CantineThunk => dispatch => {
  dispatch(cantineActions.selectStructure(selectedStructureStorage.read()));
};
