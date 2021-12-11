import I18n from 'i18n-js';
import Toast from 'react-native-tiny-toast';

import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { ISignature } from '~/modules/zimbra/state/signature';

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
    const bodyData = {
      useSignature: isGlobalSignature,
    };
    if (signatureData !== '') {
      bodyData['signature'] = signatureData;
    }
    try {
      await fetchJSONWithCache(`/zimbra/signature`, {
        method: 'PUT',
        body: JSON.stringify(bodyData),
      });
      Toast.show(I18n.t('zimbra-signature-added'), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: '95%', backgroundColor: 'black' },
      });
    } catch (e) {
      Toast.show(I18n.t('zimbra-signature-error'), {
        position: Toast.position.BOTTOM,
      });
    }
  },
};
