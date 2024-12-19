import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';
import fileHandlerService, { IUploadCallbaks } from '~/framework/util/fileHandler/service';
import { fetchJSONWithCache, signedFetch } from '~/infra/fetchWithCache';

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
      id: att.id,
      size: att.filesize,
    })),
  };
};

export const newMailService = {
  addAttachment: async (session: AuthLoggedAccount, draftId: string, file: LocalFile, callbacks?: IUploadCallbaks) => {
    const url = `/conversation/message/${draftId}/attachment`;
    const uploadedFile = await fileHandlerService.uploadFile<SyncedFileWithId>(
      session,
      file,
      {
        headers: {
          Accept: 'application/json',
        },
        url,
      },
      data => {
        const json = JSON.parse(data) as { id: string };
        return {
          id: json.id,
          url: `/conversation/message/${draftId}/attachment/${json.id}`,
        };
      },
      callbacks,
      SyncedFileWithId,
    );
    return uploadedFile;
  },
  deleteAttachment: async (draftId: string, attachmentId: string) => {
    const deletedAttachment = await fetchJSONWithCache(`/conversation/message/${draftId}/attachment/${attachmentId}`, {
      method: 'DELETE',
    });
    return deletedAttachment;
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
      body: JSON.stringify(formatMailDatas(mailDatas)),
      method: 'POST',
    });
    return response.id;
  },
  searchUsers: async search => {
    const searchResult = await fetchJSONWithCache(`/conversation/visible?search=${search}`);
    return searchResult;
  },
  sendMail: async (session: AuthLoggedAccount, mailDatas, draftId, inReplyTo) => {
    const params = {
      id: draftId,
      'In-Reply-To': inReplyTo,
    };
    const paramsUrl = Object.entries(params)
      .filter(([key, value]) => !!value)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    await signedFetch(`${session.platform.url}/conversation/send${paramsUrl?.length > 0 ? '?' + paramsUrl : ''}`, {
      body: JSON.stringify(formatMailDatas(mailDatas)),
      method: 'POST',
    });
  },
  updateDraftMail: async (mailId, mailDatas) => {
    await fetchJSONWithCache(`/conversation/draft/${mailId}`, { body: JSON.stringify(formatMailDatas(mailDatas)), method: 'PUT' });
  },
};
