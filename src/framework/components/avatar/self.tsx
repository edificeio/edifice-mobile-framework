/**
 * SelfAvatar
 * display a signle avatar that render the current user's profile picture.
 * If not logged, display the default picture.
 */

import React from 'react';

import { useSelector } from 'react-redux';

import { selectors } from '~/framework/modules/auth/redux/reducer';

import { SingleAvatar } from './single';
import { SingleUserAvatarProps } from './types';

export function SelfAvatar(props: Omit<SingleUserAvatarProps, 'userId'>) {
  const session = useSelector(selectors.session);
  return <SingleAvatar userId={session?.user.id} {...props} />;
}
