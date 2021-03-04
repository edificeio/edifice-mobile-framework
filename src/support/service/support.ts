import RNFB from "rn-fetch-blob";

import Conf from "../../../ode-framework-conf";
import { fetchJSONWithCache } from "../../infra/fetchWithCache";
import { getAuthHeader } from "../../infra/oauth";
import { ITicket } from "../containers/Support";

export const supportService = {
  createTicket: async (ticket: ITicket) => {
    return await fetchJSONWithCache(`/support/ticket`, {
      method: "POST",
      body: JSON.stringify(ticket),
    });
  },
  addAttachment: async (file: any, handleProgession) => {
    const url = `${(Conf.currentPlatform as any).url}/workspace/document?protected=true&application=media-library`;
    const headers = { ...getAuthHeader(), "Content-Type": "multipart/form-data" };

    return RNFB.fetch("POST", url, headers, [
      { name: file.name, type: file.mime, filename: file.name, data: RNFB.wrap(file.uri) },
    ])
      .uploadProgress({ interval: 100 }, (written, total) => handleProgession((written / total) * 100))
      .then(response => {
        if (response && response.respInfo.status >= 200 && response.respInfo.status < 300) {
          const parsedResponse = JSON.parse(response.data);
          let uploadedFile = {
            id: parsedResponse._id,
            filename: parsedResponse.name,
            contentType: parsedResponse.metadata["content-type"],
          };
          return Promise.resolve(uploadedFile);
        } else {
          console.error("Attachment upload failed", response.data);
          return Promise.reject(response.data);
        }
      });
  },
  deleteAttachment: async (attachmentId: string) => {
    let attachmentArray = [] as string[];
    return await fetchJSONWithCache(`/workspace/documents/trash`, {
      method: "PUT",
      body: JSON.stringify({ ids: attachmentArray.concat(attachmentId) }),
    });
  },
};
