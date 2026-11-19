import type { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';
import type * as Model from '~/modules/auth/model';

/**
 * Formats of the API of the authentication (sent to or received from the platform). They don't leave `service/`: the service
 * takes and gives types of the model (see `adapter.ts`).
 * When a format is the same as a type of the model, it is an alias of it (decided on 2026-11-19): the type is written once, in
 * the model. If the format changes, the alias becomes its own type here, and the adapter translates it.
 */
export namespace API {
  /** `GET /auth/user/requirements`. */
  export type UserRequirementsResponse = Model.IUserRequirements;

  /** `GET /auth/user/mfa/code`. */
  export type MFAValidationInfosResponse = Model.IEntcoreMFAValidationInfos;
  /** `POST /auth/user/mfa/code`. */
  export type MFAValidationStateResponse = Model.IEntcoreMFAValidationState;
  /** `GET /directory/user/mobilestate`. */
  export type MobileValidationInfosResponse = Model.IEntcoreMobileValidationInfos;
  /** `PUT|POST /directory/user/mobilestate`. */
  export type MobileValidationStateResponse = Model.IEntcoreMobileValidationState;
  /** `GET /directory/user/mailstate`. */
  export type EmailValidationInfosResponse = Model.IEntcoreEmailValidationInfos;
  /** `PUT|POST /directory/user/mailstate`. */
  export type EmailValidationStateResponse = Model.IEntcoreEmailValidationState;

  /** `POST /auth/forgot-id`, `/auth/forgot-password` (the service adds `ok`, from the status of the response). */
  export type ForgotResponse = Omit<Model.ForgotResponse, 'ok'>;

  export enum AccountTypeBackend {
    Student = 'Student',
    Relative = 'Relative',
    Teacher = 'Teacher',
    Personnel = 'Personnel',
    Guest = 'Guest',
  }

  /** `GET /auth/oauth2/userinfo`. */
  export interface IUserInfoBackend {
    userId?: string;
    username?: string;
    login?: string;
    type?: AccountTypeBackend;
    deletePending?: boolean;
    forceChangePassword?: boolean;
    needRevalidateTerms?: boolean;
    apps?: IEntcoreApp[];
    widgets?: IEntcoreWidget[];
    authorizedActions?: Model.IAuthorizedAction[];
    firstName?: string;
    functions?: { [key: string]: boolean };
    lastName?: string;
    uniqueId?: string;
    groupsIds?: string[];
    classes?: string[];
    children?: { [userId: string]: { lastName: string; firstName: string } };
    birthDate?: string;
    federated?: boolean;
  }

  /** `GET /directory/user/{id}` (private data of the user). */
  export interface UserPrivateData {
    childrenStructure?: {
      structureName: string;
      children: {
        classesNames: string[];
        displayName: string;
        externalId?: string;
        id: string;
      }[];
    }[];
    parents?: Model.UserRelative[];
    structureNodes?: Model.StructureNode[];
    homePhone?: string;
    mobile?: string;
    email?: string;
  }

  export type UserPersonDataStructureWithClasses = Pick<Model.StructureNode, 'UAI' | 'id' | 'name'> & {
    classes?: string[];
    exports?: null;
  };

  /** `GET /userbook/api/person?id={id}` (public data of the user). */
  export interface UserPersonDataBackend {
    photo?: string;
    schools?: UserPersonDataStructureWithClasses[];
  }
}
