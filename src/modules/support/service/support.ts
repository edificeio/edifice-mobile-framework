import workspaceService from '~/framework/modules/workspace/service';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { LocalFile } from '~/framework/util/fileHandler';
import { IUserSession } from '~/framework/util/session';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { ITicket } from '~/modules/support/containers/Support';

export const supportService = {
  createTicket: async (ticket: ITicket) => {
    if (ticket.attachments !== undefined && ticket.attachments.length > 0) {
      ticket.attachments.map(att => {
        return delete att['contentType'];
      });
    } else delete ticket.attachments;
    const response = await fetchJSONWithCache(`${DEPRECATED_getCurrentPlatform()!.url}/support/ticket`, {
      method: 'POST',
      body: JSON.stringify(ticket),
    });

    return response;
  },
  addAttachment: async (file: LocalFile, handleProgession, session: IUserSession) => {
    try {
      const distantFile = await workspaceService.uploadFile(
        session,
        file,
        { parent: 'protected' },
        {
          onProgress: progress => handleProgession((progress.totalBytesSent / progress.totalBytesExpectedToSend) * 100),
        },
      );

      return Promise.resolve({
        id: distantFile.df.id,
        name: distantFile.filename,
        contentType: distantFile.filetype,
        size: distantFile.filesize,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },
  deleteAttachment: async (attachmentId: string) => {
    const attachmentArray = [] as string[];
    return await fetchJSONWithCache(`/workspace/documents/trash`, {
      method: 'PUT',
      body: JSON.stringify({ ids: attachmentArray.concat(attachmentId) }),
    });
  },
};
