import I18n from "i18n-js";

import Conf from "../../Conf";
import { Connection } from "../../infra/Connection";
import { fetchJSONWithCache } from "../../infra/fetchWithCache";
import { adaptator } from "../../infra/HTMLAdaptator";
import { Me } from "../../infra/Me";
import { signImagesUrls } from "../../infra/oauth";

let loadingState = "idle";
const awaiters = [];
let schoolbooks = [];
const loadSchoolbooks = (): Promise<any[]> => {
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
    if (Me.session.type.indexOf("Student") !== -1) {
      // console.log("im a child");
      try {
        // console.log("session :", Me.session);
        const messages = await fetchJSONWithCache(
          `/schoolbook/list/0/${Me.session.userId}`
        );
        schoolbooks = [...schoolbooks, ...messages];
        // console.log("loaded schoolbooks list", schoolbooks);
      } catch (e) {
        console.warn(e);
      }
    } else {
      // console.log("im NOT a child");
      for (const child of Me.session.children) {
        if (!child.id) continue;
        const messages = await fetchJSONWithCache(
          `/schoolbook/list/0/${child.id}`
        );
        schoolbooks = [...schoolbooks, ...messages];
      }
      const messages = await fetchJSONWithCache(`/schoolbook/list`, {
        body: JSON.stringify({ filter: "Any", page: 0 }),
        method: "POST"
      });
      schoolbooks = [...schoolbooks, ...messages];
    }

    awaiters.forEach(a => a());
    loadingState = Connection.isOnline ? "over" : "idle";
  });
};

const dataTypes = {
  SCHOOLBOOK: async (news, timeline) => {
    const defaultContent = {
      date: news.date.$date,
      eventType: news["event-type"],
      htmlContent: undefined,
      id: news._id,
      images: signImagesUrls(
        news.preview.images.map(url => ({
          alt: "",
          src: (url as string).startsWith("/")
            ? Conf.currentPlatform.url + url
            : url
        }))
      ),
      message: news.preview.text,
      resourceName: news.params.wordTitle,
      senderId: news.sender,
      senderName: news.params.username,
      subtitle: I18n.t("schoolbook-appTitle"), // Subitle is displayed in little in NewsContent
      title: news.params.wordTitle, // Title is displayed in big in NewsContent
      type: news.type
    };
    if (!news.params.wordUri || news.params.wordUri.indexOf("word") === -1) {
      return defaultContent;
    }
    try {
      const schoolbooks = await loadSchoolbooks();
      const schoolbookId = news.params.wordUri.split("word/")[1];
      const schoolbook = schoolbooks.find(
        s => s.id === parseInt(schoolbookId, 10)
      );

      if (timeline.find(e => e.resourceId === schoolbookId)) {
        return null;
      }

      if (schoolbook) {
        return {
          ...defaultContent,
          htmlContent: schoolbook.text,
          resourceId: schoolbookId,
          title: schoolbook.title
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
        images: signImagesUrls(
          news.preview.images.map(url => ({
            alt: "",
            src: (url as string).startsWith("/")
              ? Conf.currentPlatform.url + url
              : url
          }))
        ),
        message: news.preview.text,
        resourceId: infoId,
        resourceName: news.params.resourceName,
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
        images: signImagesUrls(
          news.preview.images.map(url => ({
            alt: "",
            src: (url as string).startsWith("/")
              ? Conf.currentPlatform.url + url
              : url
          }))
        ),
        message: news.preview.text,
        resource: news.resource,
        resourceId: news["sub-resource"],
        resourceName: news.params.postTitle, // Resource name used in preview header
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
  Object.keys(availableApps).forEach(app => {
    availableAppsWithUppercase[app] = availableApps[app];
    availableAppsWithUppercase[app.toUpperCase()] = availableApps[app];
  });
  for (const result of results) {
    if (dataTypes[result.type] && availableAppsWithUppercase[result.type]) {
      const newResult = await dataTypes[result.type](result, newResults);
      if (newResult) {
        newResult.application = result.type.toLowerCase();
        newResults.push(newResult);
      }
    }
  }

  return newResults;
};
