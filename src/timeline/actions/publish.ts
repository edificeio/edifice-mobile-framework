import { Dispatch } from "redux";

import { fetchJSONWithCache, signedFetchJson } from "../../infra/fetchWithCache";
import { resourceRightFilter } from "../../utils/resourceRights";
import { createAsyncActionCreators } from "../../infra/redux/async2";
import { publishableBlogsActionTypes as publishableBlogsActionTypes, IBlog, blogPublishActionTypes } from "../state/publishableBlogs";
import { fetchTimeline } from "./list";
import { storedFilters } from "./storedFilters";
import { mainNavNavigate } from "../../navigation/helpers/navHelper";
import Conf from "../../../ode-framework-conf";

export const publishableBlogsActions = createAsyncActionCreators<IBlog[]>(publishableBlogsActionTypes);
export const fetchPublishableBlogsAction = () =>
  async (dispatch: Dispatch, getState: () => any) => {
    const api = `/blog/list/all`;
    try {
      dispatch(publishableBlogsActions.request());
      const allBlogs: IBlog[] = await fetchJSONWithCache(api);
      const filteredBlogs = resourceRightFilter(
        allBlogs,
        'org-entcore-blog-controllers-PostController|create',
        getState().user.info) as IBlog[];
      dispatch(publishableBlogsActions.receipt(filteredBlogs));
    } catch (err) {
      dispatch(publishableBlogsActions.error(err));
    }
  }


export const blogPublishActions = createAsyncActionCreators<{}>(blogPublishActionTypes);
export const publishBlogPostAction = (blog: IBlog, content: string) =>
  async (dispatch: Dispatch, getState: () => any) => {
    let api = `${Conf.currentPlatform.url}/blog/post/${blog._id}`;
    let apiOpts = { method: 'POST' }
    try {

      dispatch(blogPublishActions.request());

      const result1 = await signedFetchJson(api, {
        ...apiOpts,
        body: JSON.stringify({
          title: '',
          content: `<p>${content}</p>`
        })
      });

      api = `${Conf.currentPlatform.url}/blog/post/publish/${blog._id}/${(result1 as {_id: string})._id}`;
      apiOpts = { method: 'PUT' };
      const result2 = await signedFetchJson(api, apiOpts);

      dispatch(blogPublishActions.receipt([result1, result2]));

      // Fetch timeline at the end
      const legalapps = getState().user.auth.apps;
      const availableApps = await storedFilters(legalapps);
      fetchTimeline(dispatch)(availableApps);

      // Nav back to timeline
      mainNavNavigate('notifications');

    } catch (err) {
      dispatch(blogPublishActions.error(err));
    }
  }
