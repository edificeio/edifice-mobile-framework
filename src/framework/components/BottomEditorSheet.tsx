import * as React from 'react';
import { useSelector } from 'react-redux';

import { getUserSession } from '../util/session';
import { BottomSheet } from './BottomSheet';
import CommentField, { CommentFieldProps } from './commentField';

const BottomEditorSheet = ({ isResponse, isPublishingComment, onPublishComment }: CommentFieldProps, ref) => {
  const session = useSelector(() => getUserSession());
  const commentFieldRef: { current: any } = React.createRef();
  const clearCommentField = () => commentFieldRef?.current?.clearCommentField();
  const confirmDiscard = (quitCallback?: Function, continueCallback?: Function) => {
    commentFieldRef?.current?.confirmDiscard(quitCallback, continueCallback);
  };
  const doesCommentExist = () => commentFieldRef?.current?.doesCommentExist();
  React.useImperativeHandle(ref, () => ({ clearCommentField, confirmDiscard, doesCommentExist }));
  return (
    <BottomSheet
      content={
        <CommentField
          ref={commentFieldRef}
          isPublishingComment={isPublishingComment}
          onPublishComment={onPublishComment}
          commentAuthorId={session.user.id}
          isResponse={isResponse}
        />
      }
    />
  );
};

export default React.forwardRef(BottomEditorSheet);
