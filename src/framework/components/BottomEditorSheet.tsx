import * as React from 'react';

import { useSelector } from 'react-redux';

import { BottomSheet, BottomSheetProps } from '~/framework/components/BottomSheet';
import CommentField, { CommentFieldProps } from '~/framework/components/commentField';
import { getSession } from '~/framework/modules/auth/reducer';

const BottomEditorSheet = (
  {
    displayShadow,
    isPublishingComment,
    isResponse,
    onChangeText,
    onPublishComment,
  }: CommentFieldProps & Omit<BottomSheetProps, 'content'>,
  ref,
) => {
  const session = useSelector(() => getSession());
  const commentFieldRef: { current: any } = React.createRef();
  return (
    <BottomSheet
      displayShadow={displayShadow}
      content={
        <CommentField
          ref={commentFieldRef}
          isPublishingComment={isPublishingComment}
          onPublishComment={onPublishComment}
          commentAuthorId={session?.user.id}
          isResponse={isResponse}
          onChangeText={data => {
            if (onChangeText) onChangeText(data);
          }}
        />
      }
    />
  );
};

export default React.forwardRef(BottomEditorSheet);
