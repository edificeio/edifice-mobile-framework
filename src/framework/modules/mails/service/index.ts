export const mailsService = {
  attachments: {
    add: async () => {},
    remove: async () => {
      const api = '/conversation/message/mailId/attachment/attachmentID';
    },
  },
  folder: {
    count: async (params: { folderName: string; unread: boolean }) => {
      const api = `/conversation/count/${params.folderName}?unread=${params.unread}`;
    },
    create: async (payload: { name: string; parentID?: string }) => {
      const api = '/conversation/folder';
    },
  },
  folders: {
    getAll: async (params: { unread: boolean }) => {
      const api = `/conversation/userfolders/list&unread=${params.unread}`;
    },
    getSubfolders: async (params: { unread: boolean; folderParentId: string }) => {
      const api = `/conversation/userfolders/list&unread=${params.unread}&parentId=${params.folderParentId}`;
    },
  },
  mail: {
    delete: async (payload: { id: string[] }) => {
      const api = '/conversation/delete';
    },
    forward: async (params: { mailId: string; forwardFrom: string }) => {
      // revoir forwardfrom
      const api = `/conversation/message/${params.mailId}/forward/${params.forwardFrom}`;
    },
    getContent: async (params: { mailId: string }) => {
      const api = `/conversation/message/${params.mailId}`;
    },
    markUnread: async (payload: { id: string[]; unread: boolean }) => {
      const api = '/conversation/toggleUnread';
    },
    moveToFolder: async (params: { folderId: string }, payload: { id: string[] }) => {
      const api = `/conversation/move/userfolder/${params.folderId}`;
    },
    moveToTrash: async (payload: { id: string[] }) => {
      const api = '/conversation/trash';
    },
    removeFromFolder: async (params: { mailIds: string[] }) => {
      const idsToString = params.mailIds.reduce((s, id) => s + 'id=' + id + '&', '');
      const api = `/conversation/move/root?${idsToString}`;
    },
    restore: async (payload: { id: string[] }) => {
      const api = '/conversation/restore';
    },
    send: async (
      params: { draftId: string },
      payload: { body: string; to: string[]; cc: string[]; cci: string[]; subject: string },
    ) => {
      const api = `/conversation/send?id=${params.draftId}`;
    },
    sendToDraft: async (payload: { body: string; to: string[]; cc: string[]; cci: string[]; subject: string }) => {
      const api = '/conversation/draft';
    },
    updateDraft: async (
      params: { draftId: string },
      payload: { body: string; to: string[]; cc: string[]; cci: string[]; subject: string },
    ) => {
      const api = `/conversation/draft/${params.draftId}`;
    },
  },
  mails: {
    getAll: async (params: { folderName: string; pageNb: number; unread: boolean }) => {
      const api = `/conversation/list/${params.folderName}?page=${params.pageNb}&unread=${params.unread}`;
    },
    getAllByFolderId: async (params: { folderId: string; pageNb: string; unread: boolean }) => {
      const api = `/conversation/list/${params.folderId}?restrain&page=${params.pageNb}&unread=${params.unread}`;
    },
  },
  signature: {},
  visibles: {
    getAll: async () => {
      const api = '/conversation/visible';
    },
    search: async (params: { search: string }) => {
      const api = `/conversation/visible?search=${params.search}`;
    },
  },
};
