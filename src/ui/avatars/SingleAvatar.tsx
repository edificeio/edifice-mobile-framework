import * as React from 'react';

import Avatar, { Size, Status } from './Avatar';

export interface IAvatarsState {
  size?: {
    height: number;
    width: number;
  };
  slideIndex: number;
  userId:
    | string
    | {
        id: string;
        isGroup: boolean;
      };
  status?: Status;
}

export const SingleAvatar = ({ size, status, userId }) => (
  <Avatar status={status} size={Size.large} sourceOrId={userId} width={size} />
);
