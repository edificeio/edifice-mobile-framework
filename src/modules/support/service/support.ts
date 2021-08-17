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
        id: distantFile.fileid,
        name: distantFile.filename,
        contentType: distantFile.filetype,
        size: distantFile.filesize,
      });
    } catch (error) {
      return Promise.reject(error);
    }
    /*try {
      const response = await fileTransfer.startUploadFileAction(
        file,
        { parent: 'protected' },
        {
          onProgress: progress => handleProgession((progress.totalBytesSent / progress.totalBytesExpectedToSend) * 100),
        },
      );
      // const parsedResponse = JSON.parse(response); //.body???;
      
    } catch (error) {
      return Promise.reject(error);
    }*/
    /*  
    const url = `${(Conf.currentPlatform as any).url}/workspace/document?protected=true&application=media-library`;
    const headers = { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' };

    return RNFB.fetch('POST', url, headers, [{ name: file.name, type: file.mime, filename: file.name, data: RNFB.wrap(file.uri) }])
      .uploadProgress({ interval: 100 }, (written, total) => handleProgession((written / total) * 100))
      .then(response => {
        if (response && response.respInfo.status >= 200 && response.respInfo.status < 300) {
          const parsedResponse = JSON.parse(response.data);
          let uploadedFile: IAttachment = {
            id: parsedResponse._id,
            name: parsedResponse.name,
            contentType: parsedResponse.metadata['content-type'],
            size: parsedResponse.metadata.size,
          };
          return Promise.resolve(uploadedFile);
        } else {
          console.error('Attachment upload failed', response.data);
          return Promise.reject(response.data);
        }
      });*/
  },
  deleteAttachment: async (attachmentId: string) => {
    let attachmentArray = [] as string[];
    return await fetchJSONWithCache(`/workspace/documents/trash`, {
      method: 'PUT',
      body: JSON.stringify({ ids: attachmentArray.concat(attachmentId) }),
    });
  },
};
