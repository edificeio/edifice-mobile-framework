import Conf from '../../../../ode-framework-conf';
import workspaceService from '../../../framework/modules/workspace/service';
import { LocalFile } from '../../../framework/util/fileHandler';
import { IUserSession } from '../../../framework/util/session';
import { fetchJSONWithCache } from '../../../infra/fetchWithCache';
import { ITicket } from '../containers/Support';

export const supportService = {
  createTicket: async (ticket: ITicket) => {
    if (ticket.attachments !== undefined && ticket.attachments.length > 0) {
      ticket.attachments.map(att => {
        return delete att['contentType'];
      });
    } else delete ticket.attachments;
    const response = await fetchJSONWithCache(`${(Conf.currentPlatform as any).url}/support/ticket`, {
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
        id: distantFile.id,
        name: distantFile.filename,
        contentType: distantFile.filetype,
        size: distantFile.filesize,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },
  deleteAttachment: async (attachmentId: string) => {
    let attachmentArray = [] as string[];
    return await fetchJSONWithCache(`/workspace/documents/trash`, {
      method: 'PUT',
      body: JSON.stringify({ ids: attachmentArray.concat(attachmentId) }),
    });
  },
};
