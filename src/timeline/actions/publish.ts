import { Dispatch, AnyAction } from "redux";

import { fetchJSONWithCache, signedFetchJson } from "../../infra/fetchWithCache";
import { resourceRightFilter, resourceHasRight } from "../../utils/resourceRights";
import { createAsyncActionCreators, AsyncState } from "../../infra/redux/async2";
import { publishableBlogsActionTypes as publishableBlogsActionTypes, IBlog, blogPublishActionTypes, IBlogList } from "../state/publishableBlogs";
import { fetchTimeline } from "./list";
import { storedFilters } from "./storedFilters";
import { mainNavNavigate } from "../../navigation/helpers/navHelper";
import { notifierShowAction } from "../../infra/notifier/actions";
import { ThunkDispatch } from "redux-thunk";
import I18n from "i18n-js";
import { Trackers } from "~/framework/util/tracker";
import { DEPRECATED_getCurrentPlatform } from "~/framework/util/_legacy_appConf";

export const publishableBlogsActions = createAsyncActionCreators<IBlog[]>(publishableBlogsActionTypes);
export const fetchPublishableBlogsAction = (optional: boolean = false) =>
  async (dispatch: Dispatch, getState: () => any) => {
    const state = getState();
    if (optional && (
      !(state.timeline.publishableBlogs as AsyncState<IBlogList>).isPristine
      || (state.timeline.publishableBlogs as AsyncState<IBlogList>).isFetching)
    ) return;
    const api = `/blog/list/all`;
    try {
      dispatch(publishableBlogsActions.request());
      const allBlogs: IBlog[] = await fetchJSONWithCache(api);
      const filteredBlogs = (resourceRightFilter(
        allBlogs,
        'org-entcore-blog-controllers-PostController|create',
        getState().user.info) as IBlog[])
        .filter((blog: IBlog) => !blog.trashed && blog.shared && blog.shared.length > 0);
      dispatch(publishableBlogsActions.receipt(filteredBlogs));
    } catch (err) {
      dispatch(publishableBlogsActions.error(err));
    }
  }


export const blogPublishActions = createAsyncActionCreators<{}>(blogPublishActionTypes);
export const publishBlogPostAction = (blog: IBlog, title: string, content: string, uploadedBlogPostDocuments?: any) =>
  async (dispatch: Dispatch & ThunkDispatch<any, void, AnyAction>, getState: () => any) => {
    let api = `${DEPRECATED_getCurrentPlatform()!.url}/blog/post/${blog._id}`;
    let apiOpts = { method: 'POST' }

    try {
      let blogPostHtml = `<p class="ng-scope" style="">${content}</p>`
      if (uploadedBlogPostDocuments) {
        const blogPostUploads = Object.values(uploadedBlogPostDocuments)
        const images = blogPostUploads.map(blogPostUpload => `<img src="${blogPostUpload.url}?thumbnail=2600x0" class="">`).join("")
        const imagesHtml =
          `<p class="ng-scope" style="">
          <span contenteditable="false" class="image-container ng-scope" style="">
            ${images}
          </span>
        </p>`
        blogPostHtml = blogPostHtml + imagesHtml
      }

      dispatch(blogPublishActions.request());

      const result1 = await signedFetchJson(api, {
        ...apiOpts,
        body: JSON.stringify({
          title,
          content: blogPostHtml
        })
      });

      const hasSubmitRight = resourceHasRight(blog, 'org-entcore-blog-controllers-PostController|submit', getState().user.info);
      const hasPublishRight = resourceHasRight(blog, 'org-entcore-blog-controllers-PostController|publish', getState().user.info);

      const api2 = hasPublishRight
        ? `${DEPRECATED_getCurrentPlatform()!.url}/blog/post/publish/${blog._id}/${(result1 as { _id: string })._id}`
        : hasSubmitRight
          ? `${DEPRECATED_getCurrentPlatform()!.url}/blog/post/submit/${blog._id}/${(result1 as { _id: string })._id}`
          : undefined;
      apiOpts = { method: 'PUT' };
      const result2 = api2 && await signedFetchJson(api2, apiOpts);

      dispatch(blogPublishActions.receipt([result1, result2]));

      Trackers.trackEvent('Timeline', 'CREATE', 'BlogPost');

      // Fetch timeline at the end
      const legalapps = getState().user.auth.apps;
      const availableApps = await storedFilters(legalapps);
      fetchTimeline(dispatch)(availableApps);

      // Nav back to timeline
      mainNavNavigate('notifications');
      dispatch(notifierShowAction({
        id: "timeline",
        text: I18n.t(
          hasSubmitRight || hasPublishRight
            ? blog['publish-type'] === 'IMMEDIATE' ? 'createPost-publishSuccess' : 'createPost-submitSuccess'
            : 'createPost-createSuccess'
          ),
        icon: 'checked',
        type: 'success',
        duration: 8000
      }));

    } catch (err) {
      dispatch(blogPublishActions.error(err));
    }
  }
