import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';
import fileHandlerService, { IUploadCallbaks } from '~/framework/util/fileHandler/service';
import { IUserSession } from '~/framework/util/session';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

export type IUser = {
  id: string;
  displayName: string;
  groupDisplayName: string;
  profile: string;
  structureName: string;
};

export type ISearchUsers = IUser[];

export type ISearchUsersGroups = {
  groups: {
    id: string;
    name: string;
    displayName: string;
    profile: string;
    structureName: string;
  }[];
  users: ISearchUsers;
};

const formatMailDatas = mailDatas => {
  return {
    ...mailDatas,
    attachments: mailDatas.attachments?.map(att => ({
      contentType: att.filetype,
      filename: att.filename,
      size: att.filesize,
      id: att.id,
    })),
  };
};

export const newMailService = {
  searchUsers: async search => {
    return await fetchJSONWithCache(`/conversation/visible?search=${search}`);
  },
  sendMail: async (mailDatas, draftId, inReplyTo) => {
    const params = {
      id: draftId,
      'In-Reply-To': inReplyTo,
    };

    const paramsUrl = Object.entries(params)
      .filter(([key, value]) => !!value)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    await fetchJSONWithCache(`/conversation/send${paramsUrl?.length > 0 ? '?' + paramsUrl : ''}`, {
      method: 'POST',
      body: JSON.stringify(formatMailDatas(mailDatas)),
    });
  },
  forwardMail: async (draftId, forwardFrom) => {
    await fetchJSONWithCache(`/conversation/message/${draftId}/forward/${forwardFrom}`, {
      method: 'PUT',
    });
  },
  makeDraftMail: async (mailDatas, inReplyTo) => {
    const params = {
      'In-Reply-To': inReplyTo,
    };

    const paramsUrl = Object.entries(params)
      .filter(([key, value]) => !!value)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const response = await fetchJSONWithCache(`/conversation/draft${paramsUrl?.length > 0 ? '?' + paramsUrl : ''}`, {
      method: 'POST',
      body: JSON.stringify(formatMailDatas(mailDatas)),
    });
    return response.id;
  },
  updateDraftMail: async (mailId, mailDatas) => {
    await fetchJSONWithCache(`/conversation/draft/${mailId}`, { method: 'PUT', body: JSON.stringify(formatMailDatas(mailDatas)) });
  },
  addAttachment: async (session: IUserSession, draftId: string, file: LocalFile, callbacks?: IUploadCallbaks) => {
    const url = `/conversation/message/${draftId}/attachment`;
    return await fileHandlerService.uploadFile<SyncedFileWithId>(
      session,
      file,
      {
        url,
        headers: {
          Accept: 'application/json',
        },
      },
      data => {
        const json = JSON.parse(data) as { id: string };
        return {
          url: `/conversation/message/${draftId}/attachment/${json.id}`,
          id: json.id,
        };
      },
      callbacks,
      SyncedFileWithId,
    );
  },
  deleteAttachment: async (draftId: string, attachmentId: string) => {
    return await fetchJSONWithCache(`/conversation/message/${draftId}/attachment/${attachmentId}`, { method: 'DELETE' });
  },
};
