import { fetchJSONWithCache } from "../../infra/fetchWithCache";
// import { fillUserData } from "../../infra/Me";

export const fetchTimeline = dispatch => async availableApps => {
  dispatch({
    type: "FETCH_TIMELINE"
  });

  try {
    // console.log("FETCH timeline");
    resetLoadingState();
    const news = await fetchJSONWithCache(
      `/timeline/lastNotifications?page=0&${writeTypesParams(availableApps)}`,
      {
        headers: {
          Accept: "application/json;version=2.0"
        }
      }
    );
    const results = news.results.filter(
      n => excludeTypes.indexOf(n["event-type"]) === -1 && n.params
    );
    // console.log("resultsts fetch", results);
    const newNews = await fillData(availableApps, results);
    // console.log("newNews fetch", newNews);

    if (newNews.length > 0) {
      dispatch({
        news: newNews,
        type: "FETCH_NEW_TIMELINE"
      });
    }
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.warn(e);
  }
};
