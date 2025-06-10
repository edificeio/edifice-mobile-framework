/**
 * Notifications
 * Types and tools for managing Notification data
 */
import { ImageURISource } from 'react-native';

import { decode } from 'html-entities';
import moment, { Moment } from 'moment';

import { AuthLoggedAccount } from '~/framework/modules/auth/model';

// Types

export interface IEntcoreAbstractNotification {
  type: string;
  'event-type': string;
  resource?: string;
  'sub-resource'?: string;
  sender?: string;
  params: {
    uri?: string;
    resourceUri?: string;
    resourceName?: string;
    username?: string;
    [key: string]: any;
  };
}

export interface IEntcoreTimelineNotification extends IEntcoreAbstractNotification {
  _id: string;
  recipients?: { userId: string; unread: boolean }[];
  date: { $date: string };
  message: string;
  preview?: {
    text: string;
    images: string[];
    medias: {
      type: 'image' | 'video' | 'audio' | 'iframe' | 'attachment';
      src: string;
      name?: string;
    }[];
  };
}

export interface IAbstractNotification {
  type: string; // Type referring notifDefinitions
  'event-type': string; // Custom event-type, in sense of a subtype
  backupData: IEntcoreTimelineNotification; // Original notification data as is
}

export interface ITimelineNotification extends IAbstractNotification {
  id: string; // Notification unique ID
  date: Moment; // Date of emission
  message: string; // Non-enriched content
}

export interface ISenderNotification extends IAbstractNotification {
  sender: {
    // Sender information
    id: string;
    displayName: string;
  };
}

export interface IResourceUriNotification extends IAbstractNotification {
  resource: {
    uri: string;
  };
}

export interface IResourceIdNotification extends IResourceUriNotification {
  resource: IResourceUriNotification['resource'] & {
    id: string;
  };
}

export interface INamedResourceNotification extends IResourceIdNotification {
  resource: IResourceIdNotification['resource'] & {
    name: string;
  };
}

export interface IEnrichedNotification extends ITimelineNotification {
  preview: {
    text: string;
    media: INotificationMedia[];
    images: string[]; // Obsolete. Use media field instead.
  };
}

export interface INotificationMedia {
  type: 'image' | 'video' | 'audio' | 'iframe' | 'attachment';
  src: string | { src: ImageURISource; alt: string };
  name?: string;
}

export interface IResourceUriCaptureFunction<IdsList extends { [someId: string]: string }> {
  (url: string): Partial<IdsList>;
}

// Getters

export const isSenderNotification = (n: IAbstractNotification) =>
  !!(n as ITimelineNotification & Partial<ISenderNotification>).sender;
export const getAsSenderNotification = (n: IAbstractNotification) =>
  isSenderNotification(n) ? (n as ISenderNotification) : undefined;

export const isResourceUriNotification = (n: IAbstractNotification) =>
  !!(n as ITimelineNotification & Partial<IResourceUriNotification>).resource;
export const getAsResourceUriNotification = (n: IAbstractNotification) =>
  isResourceUriNotification(n) ? (n as IResourceUriNotification) : undefined;

export const isResourceIdNotification = (n: IAbstractNotification) =>
  !!(n as ITimelineNotification & Partial<IResourceIdNotification>).resource?.id;
export const getAsResourceIdNotification = (n: IAbstractNotification) =>
  isResourceIdNotification(n) ? (n as IResourceIdNotification) : undefined;

export const isNamedResourceNotification = (n: IAbstractNotification) =>
  !!(n as ITimelineNotification & Partial<INamedResourceNotification>).resource?.name;
export const getAsNamedResourceNotification = (n: IAbstractNotification) =>
  isNamedResourceNotification(n) ? (n as INamedResourceNotification) : undefined;

export const isEnrichedNotification = (n: ITimelineNotification) =>
  !!(n as ITimelineNotification & Partial<IEnrichedNotification>).preview;
export const getAsEnrichedNotification = (n: ITimelineNotification) =>
  isEnrichedNotification(n) ? (n as IEnrichedNotification) : undefined;

export const isMyNotification = (n: ISenderNotification, u: AuthLoggedAccount) => n.sender.id === u.user.id;

// Adapter

export const notificationAdapter = (n: IEntcoreAbstractNotification) => {
  const ret = {
    backupData: n,
    'event-type': n['event-type'],
    type: n.type,
  };
  if ((n as IEntcoreTimelineNotification)._id) {
    (ret as ITimelineNotification).id = (n as IEntcoreTimelineNotification)._id;
  }
  if ((n as IEntcoreTimelineNotification).date) {
    (ret as ITimelineNotification).date = moment((n as IEntcoreTimelineNotification).date.$date);
  }
  if ((n as IEntcoreTimelineNotification).message) {
    (ret as ITimelineNotification).message = (n as IEntcoreTimelineNotification).message;
  }
  if (n.sender && n.params.username) {
    (ret as ISenderNotification).sender = {
      displayName: n.params.username!,
      id: n.sender,
    };
  }
  if (n.params.resourceUri) {
    (ret as IResourceUriNotification).resource = {
      uri: n.params.resourceUri!,
    };
  }
  if (n.params.resourceUri && n.resource) {
    (ret as IResourceIdNotification).resource = {
      id: n.resource,
      uri: n.params.resourceUri!,
    };
  }
  if (n.params.resourceUri && n.resource && n.params.resourceName) {
    (ret as INamedResourceNotification).resource = {
      id: n.resource,
      name: n.params.resourceName!,
      uri: n.params.resourceUri!,
    };
  }
  if ((n as IEntcoreTimelineNotification).preview) {
    (ret as IEnrichedNotification).preview = {
      images: (n as IEntcoreTimelineNotification).preview!.images,
      media: (n as IEntcoreTimelineNotification).preview!.medias,
      text: decode((n as IEntcoreTimelineNotification).preview!.text),
    };
  }
  // ToDo Modules this with registered modules map
  return ret as IAbstractNotification;
};
