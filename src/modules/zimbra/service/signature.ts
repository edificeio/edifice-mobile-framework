import { fetchJSONWithCache } from "../../../infra/fetchWithCache";
import { ISignature } from "../state/signature";

export type ISignatureBackend = {
  preference: {
    useSignature: boolean;
    signature: string;
  };
  id: string;
  zimbraENTSignatureExists: boolean;
};

const SignatureAdapter: (data: ISignatureBackend) => ISignature = data => {
  let result = {} as ISignature;
  if (!data) return result;
  result = {
    preference: data.preference,
    id: data.id,
    zimbraENTSignatureExists: data.zimbraENTSignatureExists,
  };
  return result;
};

export const signatureService = {
  getSignature: async () => {
    const data = SignatureAdapter(await fetchJSONWithCache(`/zimbra/signature`));
    return data;
  },
  putSignature: async (signatureData: string, isGlobalSignature: boolean) => {
    return await fetchJSONWithCache(`/zimbra/signature`, {
      method: "PUT",
      body: JSON.stringify({
        signature: signatureData,
        useSignature: isGlobalSignature,
      }),
    });
  },
};
