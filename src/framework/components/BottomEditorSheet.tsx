import * as React from 'react';
import { useSelector } from 'react-redux';

import { BottomSheet, BottomSheetProps } from '~/framework/components/BottomSheet';
import CommentField, { CommentFieldProps } from '~/framework/components/commentField';
import { getUserSession } from '~/framework/util/session';

const BottomEditorSheet = (
  { isResponse, isPublishingComment, onPublishComment, displayShadow }: CommentFieldProps & Omit<BottomSheetProps, 'content'>,
  ref,
) => {
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
      displayShadow={displayShadow}
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
