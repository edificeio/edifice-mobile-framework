import * as React from 'react';

import moment from 'moment';

import { CantineData, MenuItem } from '~/framework/modules/widgets/cantine/model';
import { cantineService } from '~/framework/modules/widgets/cantine/service';
import {
  cantineMenuCache,
  cantineMenuKey,
  fetchCantineMenuOnce,
  hasMenuItems,
} from '~/framework/modules/widgets/cantine/service/cache';
import { ISO_DATE_FORMAT } from '~/framework/util/date';
import { HTTPError } from '~/framework/util/transport/error';

interface CantineMenuState {
  menu: MenuItem[];
  dinnerMenu?: MenuItem[];
  error: boolean;
  loading: boolean;
}

const LOADING_STATE: CantineMenuState = { error: false, loading: true, menu: [] };
const ERROR_STATE: CantineMenuState = { error: true, loading: false, menu: [] };

// treat a 400 response as an empty menu.
const isMissingMenu = (error: unknown) => error instanceof HTTPError && error.status === 400;

const loadedState = (data?: CantineData): CantineMenuState => ({
  dinnerMenu: data?.dinnerAvailable ? data.dinnerMenu : undefined,
  error: false,
  loading: false,
  menu: data?.menu ?? [],
});

const initialState = (key?: string): CantineMenuState => {
  const cached = key ? cantineMenuCache.read(key) : undefined;
  return cached ? loadedState(cached.data) : LOADING_STATE;
};

export function useCantineMenu(userId: string, uai?: string, date?: string) {
  const day = date ?? moment().format(ISO_DATE_FORMAT);
  const key = uai ? cantineMenuKey(userId, uai, day) : undefined;

  const [state, setState] = React.useState<CantineMenuState>(() => initialState(key));
  // reset state when the menu key changes.
  const [stateKey, setStateKey] = React.useState(key);
  if (stateKey !== key) {
    setStateKey(key);
    setState(initialState(key));
  }
  // ignore responses from previous requests.
  const lastRequest = React.useRef<number>(0);

  // force a refresh even when cache is fresh.
  const load = React.useCallback(
    async (force?: boolean) => {
      if (!key || !uai) return;

      const request = ++lastRequest.current;
      const cached = cantineMenuCache.read(key);
      if (cached) {
        setState(loadedState(cached.data));
        if (!force && cantineMenuCache.isFresh(cached)) return;
      } else {
        setState(LOADING_STATE);
      }

      try {
        const data = await fetchCantineMenuOnce(key, () => cantineService.menu(uai, moment(day)));
        cantineMenuCache.storeIfNotEmpty(key, data);
        if (request !== lastRequest.current) return;
        // keep cached menu if the response is empty.
        if (hasMenuItems(data) || !cached) setState(loadedState(data));
      } catch (error) {
        // keep cached menu if the request fails.
        if (request !== lastRequest.current || cached) return;
        setState(isMissingMenu(error) ? loadedState() : ERROR_STATE);
      }
    },
    [day, key, uai],
  );

  return { ...state, load };
}
