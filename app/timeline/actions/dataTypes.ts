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
    console.log("triggered loadSchoolbooks");
    if (loadingState === "over") {
      console.log("already done.");
      resolve(schoolbooks);
      return;
    }
    if (loadingState === "loading") {
      console.log("pending...");
      awaiters.push(() => resolve(schoolbooks));
      return;
    }
    loadingState = "loading";
    awaiters.push(() => resolve(schoolbooks));
    if (Me.session.type.indexOf("Student") !== -1) {
      console.log("im a child");
      try {
        console.log("session :", Me.session);
        const messages = await fetchJSONWithCache(
          `/schoolbook/list/0/${Me.session.userId}`
        );
        schoolbooks = [...schoolbooks, ...messages];
        console.log("loaded schoolbooks list", schoolbooks);
      } catch (e) {
        console.warn(e);
      }
    } else {
      console.log("im NOT a child");
      console.log("session :", Me.session);
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
      console.log("loaded schoolbooks list", schoolbooks);
    }

    awaiters.forEach(a => a());
    loadingState = Connection.isOnline ? "over" : "idle";
  });
};

const dataTypes = {
  SCHOOLBOOK: async (news, timeline) => {
    const defaultContent = {
      date: news.date.$date,
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
      resourceName: I18n.t("schoolbook-appTitle"),
      senderId: news.sender,
      senderName: news.params.username,
      subtitle: I18n.t("schoolbook-appTitle"), // Subitle is displayed in little in NewsContent
      title: news.params.wordTitle // Title is displayed in big in NewsContent
    };
    if (!news.params.wordUri || news.params.wordUri.indexOf("word") === -1) {
      console.log("unable to find the distant url resource.");
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
        console.log("HAHAH voici ud html", schoolbook.text);
        return {
          ...defaultContent,
          htmlContent: schoolbook.text,
          resourceId: schoolbookId,
          title: schoolbook.title
        };
      }
      console.log("OOOOohhh pas de html...");
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
        subtitle: I18n.t("News"), // Subitle is displayed in little in NewsContent
        title: news.params.resourceName, // Title is displayed in big in NewsContent
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
        subtitle: news.params.blogTitle, // Subtitle is displayed in little in NewsContent
        title: news.params.postTitle, // Title is displayed in big in NewsContent
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
