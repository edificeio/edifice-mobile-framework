import I18n from 'i18n-js';
import { Moment } from 'moment';
import * as React from 'react';
import { Alert, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

import theme from '~/app/theme';
import { getUserSession } from '~/framework/util/session';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

import { displayPastDate } from '../util/date';
import { RoundButton } from './RoundButton';
import { UI_SIZES } from './constants';
import { TextItalic, TextSemiBold, TextSizeStyle } from './text';

// TYPES ==========================================================================================

export interface CommentFieldProps {
  isPublishingComment: boolean;
  onPublishComment?: (comment: string, commentId?: string) => any;
  onDeleteComment?: (commentId: string) => any;
  editCommentCallback?: Function;
  comment?: string;
  commentId?: number | string;
  commentAuthorId?: string;
  commentAuthor?: string;
  commentDate?: string | Moment;
  index?: number;
  isResponse?: boolean;
}

// COMPONENT ======================================================================================

const CommentField = (props: CommentFieldProps, ref) => {
  //  Due to Alert + Keyboard bug, we need to set/unset a flag when Alert is displayed/discarded
  let alertDisplayed = false;
  const resetAlertDisplay = () => setTimeout(() => (alertDisplayed = false), 1000);
  const inputRef: { current: TextInput | undefined } = React.useRef();

  const session = useSelector(() => getUserSession());
  const [isEditing, setIsEditing] = React.useState(false);
  const [comment, setComment] = React.useState<string>(props.comment || '');
  const isUserComment = session.user.id === props.commentAuthorId;
  const isIdleExistingComment = !!props.commentId && !isEditing;
  const isFirstComment = props.index === 0;

  const publishComment = () => {
    inputRef.current && inputRef.current.blur();
    props.onPublishComment && props.onPublishComment(comment, props.commentId?.toString());
  };
  const editComment = () => {
    setIsEditing(true);
    props.editCommentCallback && props.editCommentCallback();
  };
  const deleteComment = () => {
    props.onDeleteComment && props.commentId && props.onDeleteComment(props.commentId?.toString());
  };

  const clearCommentField = () => {
    inputRef.current && inputRef.current.clear();
    setComment('');
  };
  const confirmDiscard = (quitCallback?: Function, continueCallback?: Function) => {
    if (comment && !props.isPublishingComment && !alertDisplayed) {
      alertDisplayed = true; //  Due to Alert + Keyboard bug, we need to set a flag when Alert is displayed
      Alert.alert(
        I18n.t(`common.confirmationUnsaved${props.commentId ? 'Modification' : 'Publication'}`),
        I18n.t(
          `common.${props.isResponse ? 'response' : 'comment'}.confirmationUnsaved${
            props.commentId ? 'Modification' : 'Publication'
          }`,
        ),
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
  const setIsEditingFalse = () => setIsEditing(false);
  const doesCommentExist = () => !!comment;
  const isCommentUnchanged = () => comment === props.comment;
  const isCommentFieldFocused = () => inputRef.current?.isFocused();
  React.useImperativeHandle(ref, () => ({
    clearCommentField,
    confirmDiscard,
    setIsEditingFalse,
    doesCommentExist,
    isCommentUnchanged,
    isCommentFieldFocused,
  }));

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current && inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <View
      style={{
        backgroundColor: theme.ui.background.card,
        padding: props.commentId ? UI_SIZES.spacing.large : undefined,
        borderTopWidth: props.commentId && isFirstComment ? 1 : 0,
        borderBottomWidth: props.commentId ? 1 : 0,
        borderTopColor: theme.greyPalette.pearl,
        borderBottomColor: theme.greyPalette.pearl,
        alignItems: isIdleExistingComment ? undefined : 'flex-end',
        flexDirection: isIdleExistingComment ? 'column' : 'row',
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <SingleAvatar size={isIdleExistingComment ? 24 : 36} userId={props.commentAuthorId || session.user.id} />
        {isIdleExistingComment && props.commentAuthor && props.commentDate ? (
          <>
            <TextSemiBold numberOfLines={1} style={{ ...TextSizeStyle.Small, marginLeft: UI_SIZES.spacing.medium, flexShrink: 1 }}>
              {props.commentAuthor}
            </TextSemiBold>
            <TextItalic style={{ ...TextSizeStyle.Small, marginLeft: UI_SIZES.spacing.small, color: theme.greyPalette.graphite }}>
              {typeof props.commentDate === 'string' ? props.commentDate : displayPastDate(props.commentDate)}
            </TextItalic>
          </>
        ) : null}
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.greyPalette.fog,
          borderWidth: isIdleExistingComment ? 0 : 1,
          borderColor: theme.greyPalette.cloudy,
          borderRadius: UI_SIZES.radius.mediumPlus,
          marginLeft: UI_SIZES.spacing[isIdleExistingComment ? 'extraLargePlus' : 'smallPlus'],
          paddingHorizontal: UI_SIZES.spacing.medium,
          paddingVertical: UI_SIZES.spacing.smallPlus,
          maxHeight: isIdleExistingComment ? undefined : UI_SIZES.elements.textFieldMaxHeight,
          height: '100%',
        }}>
        <TextInput
          ref={inputRef}
          placeholder={I18n.t(`common.${props.isResponse ? 'response' : 'comment'}.add`)}
          placeholderTextColor={theme.greyPalette.graphite}
          multiline
          scrollEnabled={!(props.isPublishingComment || isIdleExistingComment)}
          editable={!(props.isPublishingComment || isIdleExistingComment)}
          onChangeText={text => setComment(text)}
          value={comment}
          style={{ paddingTop: 0 }}
        />
      </View>
      {!isIdleExistingComment ? (
        <View style={{ marginLeft: UI_SIZES.spacing.smallPlus }}>
          <RoundButton
            iconName={isEditing ? 'pictos-save' : 'pictos-send'}
            action={() => publishComment()}
            disabled={!comment || isCommentUnchanged()}
            loading={props.isPublishingComment}
          />
        </View>
      ) : null}
      {isIdleExistingComment && isUserComment && (props.onPublishComment || props.onDeleteComment) ? (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          {props.onPublishComment ? (
            <TouchableOpacity onPress={() => editComment()}>
              <TextSemiBold style={{ color: theme.palette.primary.regular }}>{I18n.t('common.modify')}</TextSemiBold>
            </TouchableOpacity>
          ) : null}
          {props.onDeleteComment ? (
            <TouchableOpacity onPress={() => deleteComment()}>
              <TextSemiBold style={{ color: theme.palette.primary.regular, marginLeft: UI_SIZES.spacing.large }}>
                {I18n.t('common.delete')}
              </TextSemiBold>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default React.forwardRef(CommentField);
