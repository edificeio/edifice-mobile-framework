import I18n from "i18n-js";

import Conf from "../../../ode-framework-conf";
import { Connection } from "../../infra/Connection";
import { fetchJSONWithCache } from "../../infra/fetchWithCache";
import { signURISource, signURISourceArray } from "../../infra/oauth";
import { IMediaModel } from "../reducer";
import { getSessionInfo } from "../../App";

let loadingState = "idle";
const awaiters = [];
export let schoolbooks: Array<any> = [];
export const loadSchoolbooks = (): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    if (loadingState === "over") {
      resolve(schoolbooks);
      return;
    }
    if (loadingState === "loading") {
      awaiters.push(() => resolve(schoolbooks));
      return;
    }
    loadingState = "loading";
    awaiters.push(() => resolve(schoolbooks));
    if (getSessionInfo().type.indexOf("Student") !== -1) {
      try {
        let newSchoolbooks = [];

        let messages: any[] = await fetchJSONWithCache(
          `/schoolbook/list/0/${getSessionInfo().userId}`
        );
        messages = messages || [];
        newSchoolbooks = [...newSchoolbooks, ...messages];

        schoolbooks = newSchoolbooks;      
      } catch (e) {
        // tslint:disable-next-line:no-console
        console.warn(e);
      }
    } else if (getSessionInfo().type.indexOf("Teacher") !== -1) {
      try {
        let newSchoolbooks = [];

        let messages = await fetchJSONWithCache(`/schoolbook/list`, {
          body: JSON.stringify({ filter: "Any", page: 0 }),
          method: "POST"
        });
        messages = messages || [];
        newSchoolbooks = [...newSchoolbooks, ...messages];

        schoolbooks = newSchoolbooks;
      } catch (e) {
        // tslint:disable-next-line:no-console
        console.warn(e);
      }
    } else {
      try {
        let newSchoolbooks = [];

        for (const childId of Object.values((getSessionInfo() as any).childrenIds)) {
          if (!childId) continue;
          let messages = await fetchJSONWithCache(
            `/schoolbook/list/0/${childId}`
          );
          messages = messages || [];
          messages = messages.map(msg => ({ ...msg, childId }));
          newSchoolbooks = [...newSchoolbooks, ...messages];
        }

        let messages = await fetchJSONWithCache(`/schoolbook/list`, {
          body: JSON.stringify({ filter: "Any", page: 0 }),
          method: "POST"
        });
        messages = messages || [];
        newSchoolbooks = [...newSchoolbooks, ...messages];

        schoolbooks = newSchoolbooks;
      } catch (e) {
        // tslint:disable-next-line:no-console
        console.warn(e);
        throw e;
      }
    }

    awaiters.forEach(a => a());
    loadingState = Connection.isOnline ? "over" : "idle";
  });
};

const transformedSrc = (src: string) => {
  return src.startsWith("/")
  ? (Conf.currentPlatform as any).url + src
  : src
}

const transformedMedia = (media: IMediaModel[]) => {
  return media.map(mediaItem => ({
      type: mediaItem.type,
      src: mediaItem.type === "image"
      ? {src: signURISource(transformedSrc(mediaItem.src as string))}
      : transformedSrc(mediaItem.src as string)
    }))
}

const transformedImages = (images: string[]) => {
  const signedImages = signURISourceArray(images.map(url => ({alt: "", src: transformedSrc(url)})));
  return signedImages.map(image => ({type: "image", src: {...image}}));
}

const dataTypes = {
  SCHOOLBOOK: async (news, timeline) => {
    const split = news.params.resourceUri
      ? news.params.resourceUri.split("/")
      : news.params.wordUri
      ? news.params.wordUri.split("/")
      : null;
    const wordId = split && split[split.length - 1];
    const wordUri = `/schoolbook/word/${wordId}`; // news.params.wordUri || news.params.resourceUri;
    const resourceUri = `/schoolbook#/word/${wordId}`;

    const defaultContent = {
      date: news.date.$date,
      eventType: news["event-type"],
      htmlContent: undefined,
      id: news._id,
      media: news.preview.images
        ? transformedImages(news.preview.images)
        : news.preview.medias
          ? transformedMedia(news.preview.medias)
          : undefined,
      message: news.preview.text,
      resourceName: news.params.wordTitle,
      resourceUri,
      senderId: news.sender,
      senderName: news.params.username,
      subtitle: I18n.t("schoolbook-appTitle"), // Subitle is displayed in little in NewsContent
      title: news.params.wordTitle, // Title is displayed in big in NewsContent
      type: news.type,
      url: wordUri
    };

    if (!wordId || wordUri.indexOf("word") === -1) {
      return defaultContent;
    }
    try {
      await loadSchoolbooks();
      // tslint:disable-next-line:triple-equals
      const selectedSchoolbooks = schoolbooks.filter(s => s.id == wordId); // This is a dirty comparison between a string and a number. Keep "==" please.
      const childrenIds = selectedSchoolbooks.map(s => s.childId)
      const schoolbook = selectedSchoolbooks && selectedSchoolbooks[0]

      if (timeline.find(e => e.resourceId === wordId)) {
        return null;
      }

      if (schoolbook) {
        return {
          ...defaultContent,
          htmlContent: schoolbook.text,
          resourceId: wordId,
          schoolbookData: schoolbook,
          title: schoolbook.title,
          childrenIds
        };
      }
      return defaultContent;
    } catch (e) {
      return defaultContent;
    }
  },

  NEWS: async (news, timeline) => {
    try {
      const split = news.params.resourceUri.split("/");
      const infoId = split[split.length - 1];
      const threadSplit = news.params.resourceUri.split("thread/");
      const threadId = parseInt(threadSplit[threadSplit.length - 1], 10);

      return {
        date: news.date.$date,
        eventType: news["event-type"],
        id: news._id,
        media: news.preview.images
          ? transformedImages(news.preview.images)
          : news.preview.medias
            ? transformedMedia(news.preview.medias)
            : undefined,
        message: news.preview.text,
        resourceId: infoId,
        resourceName: news.params.resourceName,
        resourceUri: news.params.resourceUri,
        senderId: news.sender,
        senderName: news.params.username,
        subtitle: I18n.t("Actualites"), // Subitle is displayed in little in NewsContent
        title: news.params.resourceName, // Title is displayed in big in NewsContent
        type: news.type,
        url: `/actualites/thread/${threadId}/info/${infoId}`
      };
    } catch (e) {
      // fetching blog failed
      return news;
    }
  },

  BLOG: async (news, timeline) => {
    try {
      return {
        date: news.date.$date,
        eventType: news["event-type"],
        id: news._id,
        media: news.preview.images
          ? transformedImages(news.preview.images)
          : news.preview.medias
            ? transformedMedia(news.preview.medias)
            : undefined,
        message: news.preview.text,
        resource: news.resource,
        resourceId: news["sub-resource"],
        resourceName: news.params.postTitle, // Resource name used in preview header
        resourceUri: news.params.resourceUri,
        senderId: news.sender,
        senderName: news.params.username,
        subtitle: news.params.blogTitle, // Subtitle is displayed in little in NewsContent
        title: news.params.postTitle, // Title is displayed in big in NewsContent
        type: news.type,
        url: `/blog/post/${news.resource}/${news["sub-resource"]}`
      };
    } catch (e) {
      // fetching blog failed
      return news;
    }
  }
};

export const excludeTypes = [
  "BLOG_COMMENT",
  "BLOG_POST_SUBMIT",
  "BLOG_POST_PUBLISH",
  "NEWS-COMMENT"
];

export const fillData = async (availableApps: object, results: any[]) => {
  const newResults = [];
  const availableAppsWithUppercase = {};
  const urls: string[] = [];
  Object.keys(availableApps || {}).forEach(app => {
    availableAppsWithUppercase[app] = availableApps[app];
    availableAppsWithUppercase[app.toUpperCase()] = availableApps[app];
  });
  for (const result of results) {
    // Hack : If we want to open a push-notif that concerns a timeline notif of an unfiltered type, we have to load all types.
    // So, we will load everything and filter at render time, instead of filter at load time.
    if (
      dataTypes[result.type] /* && availableAppsWithUppercase[result.type]*/
    ) {
      const newResult = await dataTypes[result.type](result, newResults);
      if (newResult && !urls.includes(newResult.url)) {
        newResult.application = result.type.toLowerCase();
        newResults.push(newResult);
        urls.push(newResult.url);
      }
    }
  }

  return newResults;
};

export const resetLoadingState = () => {
  loadingState = "idle";
};
