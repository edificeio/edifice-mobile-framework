import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, Platform, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

import theme from '~/app/theme';
import { getUserSession } from '~/framework/util/session';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

import { LoadingIndicator } from './loading';
import { TextAction } from './text';

// TYPES ==========================================================================================

export interface ICommentField_DataProps {
  isPublishingComment: boolean;
}
export interface ICommentField_EventProps {
  onPublishComment: (comment: string, commentId?: string) => any;
}
export type ICommentField_Props = ICommentField_DataProps & ICommentField_EventProps;

// COMPONENT ======================================================================================

const CommentField = (props: ICommentField_Props, ref) => {
  //  Due to Alert + Keyboard bug, we need to set/unset a flag when Alert is displayed/discarded
  let alertDisplayed = false;
  const resetAlertDisplay = () => setTimeout(() => (alertDisplayed = false), 1000);

  const inputRef: { current: TextInput | undefined } = React.useRef();
  const session = useSelector(state => getUserSession(state));
  const [comment, setComment] = React.useState<string>('');
  const [publishButtonWidth, setPublishButtonWidth] = React.useState<number | undefined>();
  const [commentId, setCommentId] = React.useState<string | undefined>();
  const onPublish = () => {
    inputRef.current && inputRef.current.blur();
    props.onPublishComment(comment, commentId);
  };
  const clearCommentField = () => {
    inputRef.current && inputRef.current.clear();
    setComment('');
    commentId && setPublishButtonWidth(undefined);
    setCommentId(undefined);
  };
  const prefillCommentField = (comment: string, commentId: string) => {
    inputRef.current && inputRef.current.focus();
    setComment(comment);
    setCommentId(commentId);
    setPublishButtonWidth(undefined);
  };
  const confirmDiscard = (quitCallback?: Function, continueCallback?: Function) => {
    if (!props.isPublishingComment && !alertDisplayed && comment) {
      alertDisplayed = true; //  Due to Alert + Keyboard bug, we need to set a flag when Alert is displayed
      Alert.alert(
        I18n.t(`common.confirmationUnsaved${commentId ? 'Modification' : 'Publication'}`),
        I18n.t(`common.comment.confirmationUnsaved${commentId ? 'Modification' : 'Publication'}`),
        [
          {
            text: I18n.t('common.quit'),
            style: 'destructive',
            onPress: () => {
              // eslint-disable-next-line @babel/no-unused-expressions
              quitCallback ? quitCallback() : clearCommentField();
              resetAlertDisplay();
            },
          },
          {
            text: I18n.t('common.continue'),
            style: 'default',
            onPress: () => {
              // eslint-disable-next-line @babel/no-unused-expressions
              continueCallback ? continueCallback() : inputRef.current && inputRef.current.focus();
              resetAlertDisplay();
            },
          },
        ],
      );
    }
  };
  const getCommentId = () => {
    return commentId;
  };
  const getComment = () => {
    return comment;
  };
  React.useImperativeHandle(ref, () => ({ clearCommentField, prefillCommentField, confirmDiscard, getCommentId, getComment }));

  return (
    <View
      style={{
        backgroundColor: theme.color.background.card,
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: theme.color.listItemBorder,
      }}>
      <SingleAvatar userId={session.user.id} />
      <View
        style={{
          flex: 1,
          height: '100%',
          padding: 12,
          paddingVertical: Platform.OS === 'android' ? 8 : undefined,
          marginLeft: 12,
          maxHeight: 120,
          borderRadius: 20,
          borderWidth: 0.5,
          borderColor: theme.color.inputBorder,
          flexDirection: 'row',
          alignItems: 'flex-end',
        }}>
        <TextInput
          ref={inputRef}
          style={{ flex: 1, marginRight: 12, paddingTop: 0, paddingBottom: 0 }}
          placeholder={I18n.t('common.comment.addComment')}
          onChangeText={text => setComment(text)}
          value={comment}
          editable={!props.isPublishingComment}
          multiline
        />
        <View
          style={{ width: publishButtonWidth, justifyContent: 'center' }}
          onLayout={e => {
            const publishButtonWidth = e.nativeEvent.layout.width;
            setPublishButtonWidth(publishButtonWidth);
          }}>
          {props.isPublishingComment ? (
            <LoadingIndicator small />
          ) : (
            <TouchableOpacity onPress={() => onPublish()} disabled={!comment}>
              <TextAction style={{ opacity: !comment ? 0.5 : 1 }}>
                {I18n.t(`common.${commentId ? 'modify' : 'publish'}`)}
              </TextAction>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default React.forwardRef(CommentField);
