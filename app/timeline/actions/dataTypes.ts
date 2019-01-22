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
      try {
        const messages = await fetchJSONWithCache(
          `/schoolbook/list/0/${Me.session.userId}`
        );
        schoolbooks = [...schoolbooks, ...messages];
      } catch (e) {
        console.warn(e);
      }
    } else {
      for (const child of Me.session.children) {
        const messages = await fetchJSONWithCache(
          `/schoolbook/list/0/${child.id}`
        );
        schoolbooks = [...schoolbooks, ...messages];
      }
    }

    awaiters.forEach(a => a());
    loadingState = Connection.isOnline ? "over" : "idle";
  });
};

const dataTypes = {
  SCHOOLBOOK: async (news, timeline) => {
    const defaultContent = {
      date: news.date.$date,
      id: news._id,
      images: [],
      message: adaptator(news.message).toText(),
      resourceName: I18n.t("schoolbook-appTitle"),
      htmlContent: adaptator(news.message)
        .adapt()
        .toHTML(),
      senderId: news.sender,
      senderName: news.params.username,
      title: news.params.wordTitle
    };
    if (
      !news.params.resourceUri ||
      news.params.resourceUri.indexOf("word") === -1
    ) {
      return defaultContent;
    }
    try {
      const schoolbooks = await loadSchoolbooks();
      const schoolbookId = news.params.resourceUri.split("word/")[1];
      const schoolbook = schoolbooks.find(
        s => s.id === parseInt(schoolbookId, 10)
      );

      if (timeline.find(e => e.resourceId === schoolbookId)) {
        return null;
      }

      if (schoolbook) {
        return {
          date: news.date.$date,
          id: news._id,
          images: signImagesUrls(adaptator(schoolbook.text).toImagesArray()),
          message: adaptator(schoolbook.text).toText(),
          resourceName: I18n.t("schoolbook-appTitle"),
          htmlContent: adaptator(schoolbook.text)
            .adapt()
            .toHTML(),
          senderId: news.sender,
          senderName: news.params.username,
          title: schoolbook.title,
          resourceId: schoolbookId
        };
      }
      return defaultContent;
    } catch (e) {
      return defaultContent;
    }
  },

  NEWS: async (news, timeline) => {
    /*
    const newsData = {
      date: news.date.$date,
      id: news._id,
      images: [],
      message: adaptator(news.message).toText(),
      resourceName: news.params.resourceName,
      htmlContent: adaptator(news.message)
        .adapt()
        .toHTML(),
      senderId: news.sender,
      senderName: news.params.username,
      title: news.params.resourceName
    };
    if (news.params.resourceUri.indexOf("/info") === -1) {
      return newsData;
    }

    const split = news.params.resourceUri.split("/");
    const infoId = split[split.length - 1];
    const threadSplit = news.params.resourceUri.split("thread/");
    const threadId = parseInt(threadSplit[threadSplit.length - 1]);

    if (timeline.find(e => e.resourceId === infoId)) {
      return null;
    }

    try {
      const data = await fetchJSONWithCache(
        `/actualites/thread/${threadId}/info/${infoId}`
      );

      return {
        date: news.date.$date,
        id: data._id,
        images: signImagesUrls(adaptator(data.content).toImagesArray()),
        message: adaptator(data.content).toText(),
        resourceName: data.thread_title,
        senderId: news.sender,
        senderName: news.params.username,
        title: data.title,
        resourceId: infoId
      };
    } catch (e) {
      //resource has been deleted
      return newsData;
    }
    */

    try {
      const split = news.params.resourceUri.split("/");
      const infoId = split[split.length - 1];
      const threadSplit = news.params.resourceUri.split("thread/");
      const threadId = parseInt(threadSplit[threadSplit.length - 1], 10);

      return {
        date: news.date.$date,
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
        title: news.params.resourceName,
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
        resourceName: news.params.blogTitle,
        senderId: news.sender,
        senderName: news.params.username,
        title: news.params.postTitle,
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
  Object.keys(availableApps).forEach(
    app => (availableApps[app.toUpperCase()] = availableApps[app])
  );
  for (const result of results) {
    if (dataTypes[result.type] && availableApps[result.type]) {
      const newResult = await dataTypes[result.type](result, newResults);
      if (newResult) {
        newResult.application = result.type.toLowerCase();
        newResults.push(newResult);
      }
    }
  }

  return newResults;
};
