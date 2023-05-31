export interface ISignature {
  preference: {
    useSignature: boolean;
    signature: string;
  };
  zimbraENTSignatureExists: boolean;
  id: string;
}
