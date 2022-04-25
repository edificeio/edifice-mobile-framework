import * as React from 'react';
import { useSelector } from 'react-redux';

import { getUserSession } from '../util/session';
import { BottomSheet } from './BottomSheet';
import CommentField, { CommentFieldProps } from './commentField';

export const BottomEditorSheet = ({ placeholder, isPublishingComment, onPublishComment }: CommentFieldProps) => {
  const session = useSelector(() => getUserSession());
  return (
    <BottomSheet
      content={
        <CommentField
          placeholder={placeholder}
          isPublishingComment={isPublishingComment}
          onPublishComment={onPublishComment}
          commentAuthorId={session.user.id}
        />
      }
    />
  );
};
