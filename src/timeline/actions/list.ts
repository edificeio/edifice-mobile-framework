import { excludeTypes, fillData, resetLoadingState } from './dataTypes';
import { storedFilters } from './storedFilters';

import { fetchJSONWithCache } from '~/infra/fetchWithCache';

const writeTypesParams = availableApps => {
  let params = '';
  // console.log("available apps:", availableApps);
  for (const app in availableApps) {
    if (availableApps[app]) {
      params += '&type=' + app.toUpperCase();
    } else {
      // Hack : If we want to open a push-notif that concerns a timeline notif of an unfiltered type, we have to load all types.
      // So, we will load everything and filter at render time, instead of filter at load time.
      params += '&type=' + app.toUpperCase();
      // console.log("Hack : write type params true instead of false:", app);
    }
  }
  return params;
};

export const fetchTimeline = dispatch => async availableApps => {
  dispatch({
    type: 'FETCH_TIMELINE',
  });

  try {
    // console.log("FETCH timeline");
    resetLoadingState();
    const news = await fetchJSONWithCache(`/timeline/lastNotifications?page=0&${writeTypesParams(availableApps)}&both=1`, {
      headers: {
        Accept: 'application/json;version=2.0',
      },
    });
    const results = news.results.filter(n => excludeTypes.indexOf(n['event-type']) === -1 && n.params);
    // console.log("resultsts fetch", results);
    const newNews = await fillData(availableApps, results);
    // console.log("newNews fetch", newNews);

    if (newNews.length > 0) {
      dispatch({
        news: newNews,
        type: 'FETCH_NEW_TIMELINE',
      });
    }
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.warn(e);
  }
};

export const listTimeline = dispatch => async (page, availableApps, legalapps, recent?: boolean) => {
  if (recent === undefined) recent = false;

  dispatch({
    type: 'FETCH_TIMELINE',
  });

  // console.log("LIST timeline", page, recent);

  try {
    // await fillUserData();

    if (!availableApps) {
      availableApps = await storedFilters(legalapps);
      dispatch({
        availableApps,
        type: 'FILTER_TIMELINE',
      });

      dispatch({
        selectedApps: availableApps,
        type: 'PICK_FILTER_TIMELINE',
      });
    }

    const news = await fetchJSONWithCache(`/timeline/lastNotifications?page=${page}&${writeTypesParams(availableApps)}&both=1`, {
      headers: {
        Accept: 'application/json;version=2.0',
      },
    });
    const results = news.results.filter(n => excludeTypes.indexOf(n['event-type']) === -1 && n.params);
    // console.log("resultsts fill", results);
    const newNews = await fillData(availableApps, results);
    // console.log("newNews fill", newNews);

    if (newNews.length > 0) {
      dispatch({
        news: newNews,
        recent,
        type: 'APPEND_TIMELINE',
      });
    } else {
      dispatch({
        type: 'END_REACHED_TIMELINE',
      });
    }

    return newNews;
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.warn(e);
    dispatch({
      type: 'FAILED_LOAD_TIMELINE',
    });
    return [];
  }
};
