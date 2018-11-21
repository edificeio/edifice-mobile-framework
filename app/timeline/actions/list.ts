import { fetchJSONWithCache } from "../../infra/fetchWithCache";
import { fillUserData } from "../../infra/Me";
import { excludeTypes, fillData } from "./dataTypes";
import { storedFilters } from "./storedFilters";

const writeTypesParams = availableApps => {
  let params = "";
  for (let app in availableApps) {
    if (availableApps[app]) {
      params += "&type=" + app;
    }
  }
  return params;
};

export const fetchTimeline = dispatch => async availableApps => {
  dispatch({
    type: "FETCH_TIMELINE"
  });

  try {
    const news = await fetchJSONWithCache(
      `/timeline/lastNotifications?page=0&${writeTypesParams(availableApps)}`
    );
    let results = news.results.filter(
      n => excludeTypes.indexOf(n["event-type"]) === -1 && n.params
    );
    const newNews = await fillData(availableApps, results);

    if (newNews.length > 0) {
      dispatch({
        type: "FETCH_NEW_TIMELINE",
        news: newNews
      });
    }
  } catch (e) {
    console.warn(e);
  }
};

export const listTimeline = dispatch => async (page, availableApps) => {
  dispatch({
    type: "FETCH_TIMELINE"
  });

  let loading = true;

  setTimeout(() => {
    if (loading) {
      dispatch({
        type: "FAILED_LOAD_TIMELINE"
      });
    }
  }, 8000);

  try {
    await fillUserData();

    if (!availableApps) {
      availableApps = await storedFilters();
      dispatch({
        type: "FILTER_TIMELINE",
        availableApps: availableApps
      });

      dispatch({
        type: "PICK_FILTER_TIMELINE",
        selectedApps: availableApps
      });
    }

    const news = await fetchJSONWithCache(
      `/timeline/lastNotifications?page=${page}&${writeTypesParams(
        availableApps
      )}`
    );
    let results = news.results.filter(
      n => excludeTypes.indexOf(n["event-type"]) === -1 && n.params
    );
    const newNews = await fillData(availableApps, results);

    if (newNews.length > 0) {
      dispatch({
        type: "APPEND_TIMELINE",
        news: newNews
      });
    } else {
      dispatch({
        type: "END_REACHED_TIMELINE"
      });
    }

    loading = false;
    return newNews;
  } catch (e) {
    console.warn(e);
    dispatch({
      type: "FAILED_LOAD_TIMELINE"
    });

    loading = false;
    return [];
  }
};
