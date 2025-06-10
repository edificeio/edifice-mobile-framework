export namespace API {
  export namespace Wiki {
    export type ResourceRights = string;
    export interface ListPagesPayload {
      id: string;
    }
    export interface ListPagesResponse {
      _id: string;
      title: string;
      description?: string;
      pages: {
        _id: string;
        title: string;
        author: string;
        authorName: string;
        created?: { $date: string };
        modified: { $date: string };
        comments?: {
          _id: string;
          author: string;
          authorName: string;
          comment: string;
          created?: { $date: string };
          modified: { $date: string };
        }[];
        contentPlain: string;
        isVisible: boolean;
        lastContributer: string;
        lastContributerName: string;
        parentId: string | null;
        children?: {
          _id: string;
          title: string;
          isVisible: boolean;
          position: number;
        }[];
        position: number;
      }[];
      thumbnail?: string;
      created?: { $date: string };
      modified: { $date: string };
      owner: {
        userId: string;
        displayName: string;
      };
      index: string;
      shared?: {}[];
      rights: ResourceRights[];
    }

    export interface GetPagePayload extends ListPagesPayload {
      pageId: string;
    }
    export interface GetPageResponse {
      _id: string;
      author: string;
      title: string;
      authorName: string;
      content: string;
      lastContributer?: string;
      lastContributerName?: string;
      contentVersion: number;
      created?: { $date: string };
      modified: { $date: string };
      isVisible: boolean;
      parentId: string | null;
      position: number;
      jsonContent: {
        type: 'doc';
        content: object[]; // Not typed but not used in the mobile app
      };
    }
  }
}
