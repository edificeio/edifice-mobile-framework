import { CantineData } from '~/framework/modules/widgets/cantine/model';

const MENU_FRESH_DURATION_MS = 24 * 60 * 60 * 1000;
const MAX_CACHED_DAYS = 50;

interface CachedMenu {
  data: CantineData;
  fetchedAt: number;
}

const cachedMenus = new Map<string, CachedMenu>();
const pendingRequests = new Map<string, Promise<CantineData>>();

/**
 * a day is empty if it has no lunch items, even if dinner is available.
 * empty days and errors are not cached, so they are fetched again on the next visit.
 */
export const hasMenuItems = (data?: CantineData) => (data?.menu?.length ?? 0) > 0;

export const cantineMenuKey = (userId: string, uai: string, date: string) => `${userId}|${uai}|${date}`;

export const cantineMenuCache = {
  isFresh: (menu: CachedMenu) => Date.now() - menu.fetchedAt < MENU_FRESH_DURATION_MS,

  read: (key: string) => {
    const menu = cachedMenus.get(key);
    if (!menu) return undefined;
    // re-inserting marks the day as recently used, so the least recently used day is evicted first.
    cachedMenus.delete(key);
    cachedMenus.set(key, menu);
    return menu;
  },

  storeIfNotEmpty: (key: string, data: CantineData) => {
    if (!hasMenuItems(data)) return;
    cachedMenus.delete(key);
    cachedMenus.set(key, { data, fetchedAt: Date.now() });
    const leastRecentlyUsedKey = cachedMenus.keys().next().value;
    if (cachedMenus.size > MAX_CACHED_DAYS && leastRecentlyUsedKey !== undefined) cachedMenus.delete(leastRecentlyUsedKey);
  },
};

// the home widget and the menu screen both ask for today's menu: a request still pending is shared.
export function fetchCantineMenuOnce(key: string, fetch: () => Promise<CantineData>) {
  const pending = pendingRequests.get(key);
  if (pending) return pending;
  const request = fetch().finally(() => pendingRequests.delete(key));
  pendingRequests.set(key, request);
  return request;
}
