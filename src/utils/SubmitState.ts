// TYPE DEFINITIONS -------------------------------------------------------------------------------
export enum SubmitState {
  Void,
  Loading,
  Failed,
  Success,
}
export enum ContextState {
  Void,
  Loading,
  Failed,
  Success,
}

export interface IActivationContext {
  cgu: boolean;
  passwordRegex: string;
  mandatory: {
    mail: boolean;
    phone: boolean;
  };
}
