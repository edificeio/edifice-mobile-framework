import * as React from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { Moment } from 'moment';
import { useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import { CaptionBoldText, CaptionItalicText, SmallBoldText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import { displayPastDate } from '~/framework/util/date';
import { isEmpty } from '~/framework/util/object';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

// TYPES ==========================================================================================

export interface CommentFieldProps {
  isPublishingComment: boolean;
  onPublishComment?: (comment: string, commentId?: string) => any;
  onDeleteComment?: (commentId: string) => any;
  onChangeText?: ({ changed, isPublication, type, value }: InfoCommentField) => any;
  editCommentCallback?: Function;
  comment?: string;
  commentId?: number | string;
  commentAuthorId?: string;
  commentAuthor?: string;
  commentDate?: string | Moment;
  index?: number;
  isResponse?: boolean;
  onEditableLayoutHeight?: (val: number) => void;
  isManager?: boolean;
}

export interface InfoCommentField {
  type: string;
  isPublication: boolean;
  changed: boolean;
  value: string;
}

// STYLES =========================================================================================

const styles = StyleSheet.create({
  col: {
    alignItems: 'stretch',
    flex: 1,
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  textInputAndroid: {
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.mediumPlus,
    color: theme.palette.grey.black,
    flexGrow: 1,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tiny,
    textAlignVertical: 'center',
  },
  textInputIOS: {
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.mediumPlus,
    color: theme.palette.grey.black,
    flexGrow: 1,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  wrapper: {
    alignItems: 'flex-end',
    borderColor: theme.palette.grey.pearl,
    flexDirection: 'column',
  },
});

// COMPONENT ======================================================================================

const CommentField = (props: CommentFieldProps, ref) => {
  const inputRef: { current: TextInput | undefined } = React.useRef();

  const session = useSelector(() => getSession());
  const [isEditing, setIsEditing] = React.useState(false);
  const [comment, setComment] = React.useState<string>(props.comment || '');
  const isUserComment = session?.user.id === props.commentAuthorId;
  const isIdleExistingComment = !!props.commentId && !isEditing;
  const isFirstComment = props.index === 0;

  const publishComment = () => {
    if (inputRef.current) inputRef.current.blur();
    setComment(comment.trim());
    if (props.onPublishComment) props.onPublishComment(comment.trim(), props.commentId?.toString());
    if (!props.comment) setComment('');
    if (props.onChangeText)
      props.onChangeText({
        changed: false,
        isPublication: false,
        type: '',
        value: '',
      });
    setIsEditing(false);
  };
  const editComment = () => {
    setIsEditing(true);
    if (props.editCommentCallback) props.editCommentCallback();
  };
  const deleteComment = () => {
    if (props.onDeleteComment && props.commentId) props.onDeleteComment(props.commentId?.toString());
  };
  const clearCommentField = () => {
    if (inputRef.current) inputRef.current.clear();
    setComment('');
  };
  const onChangeText = React.useCallback(
    (value: string) => {
      if (props.onChangeText)
        props.onChangeText({
          changed: (!props.commentId && value.trim() !== '') || (props.commentId !== undefined && value.trim() !== props.comment),
          isPublication: !props.commentId,
          type: props.isResponse ? 'response' : 'comment',
          value,
        });
      setComment(value);
    },
    [props.onChangeText, props.isResponse, props.commentId, props.comment],
  );
  const setIsEditingFalse = () => {
    if (props.comment) {
      setComment(props.comment);
    }
    setIsEditing(false);
  };
  const isCommentUnchanged = () => comment.trim() === props.comment;
  const isCommentFieldFocused = () => inputRef.current?.isFocused();
  React.useImperativeHandle(ref, () => ({
    clearCommentField,
    isCommentFieldFocused,
    isCommentUnchanged,
    setIsEditingFalse,
  }));

  React.useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        // Kinda a hack, but works...
        if (inputRef.current) inputRef.current.focus();
      });
    }
  }, [isEditing]);

  React.useEffect(() => {
    if (props.comment) {
      setComment(props.comment);
    }
  }, [props.comment]);

  const { onEditableLayoutHeight } = props;
  const onLayoutCallback = React.useCallback(
    (event: LayoutChangeEvent) => {
      if (isEditing) {
        onEditableLayoutHeight?.(event.nativeEvent.layout.height ?? 0);
      }
    },
    [isEditing, onEditableLayoutHeight],
  );

  const wrapperStyle = React.useMemo(
    () => [
      styles.wrapper,
      {
        backgroundColor: theme.ui.background.card,
        borderBottomWidth: props.commentId ? 1 : 0,
        borderTopWidth: props.commentId && isFirstComment ? 1 : 0,
        padding: props.commentId ? UI_SIZES.spacing.medium : undefined,
      },
    ],
    [isFirstComment, props.commentId],
  );

  const textInputStyle = React.useMemo(
    () => [
      Platform.select({ android: styles.textInputAndroid, ios: styles.textInputIOS }),
      {
        borderWidth: isIdleExistingComment ? 0 : 1,
        marginLeft: isIdleExistingComment ? UI_SIZES.spacing.small : UI_SIZES.spacing.small,
        marginTop: isIdleExistingComment ? UI_SIZES.spacing.tiny : 0,
        maxHeight: isIdleExistingComment ? undefined : UI_SIZES.elements.textFieldMaxHeight,
        // 'paddingVertical seems odd on iOS, better use of paddingBottom only'
        [Platform.select({ android: 'paddingVertical', ios: 'paddingBottom' })!]: isIdleExistingComment
          ? UI_SIZES.spacing.minor
          : 0,
      },
    ],
    [isIdleExistingComment],
  );

  const textInputComponent = React.useMemo(
    () => (
      <TextInput
        ref={inputRef}
        placeholder={I18n.get(props.isResponse ? 'comment-add-response' : 'comment-add-comment')}
        placeholderTextColor={theme.palette.grey.graphite}
        multiline
        scrollEnabled={!(props.isPublishingComment || isIdleExistingComment)}
        editable={!(props.isPublishingComment || isIdleExistingComment)}
        onChangeText={text => onChangeText(text)}
        value={comment}
        style={Platform.select({
          android: textInputStyle,
          ios: undefined,
        })}
      />
    ),
    [comment, isIdleExistingComment, onChangeText, props.isPublishingComment, props.isResponse, textInputStyle],
  );

  return (
    <View style={wrapperStyle} onLayout={onLayoutCallback}>
      {/* 1st row : comment content // editor */}
      <View style={[styles.row, { alignItems: props.commentId ? 'flex-start' : 'flex-end' }]}>
        <SingleAvatar size={isIdleExistingComment ? 24 : 36} userId={props.commentAuthorId || session?.user.id} />
        <View style={styles.col}>
          {isIdleExistingComment && props.commentAuthor && props.commentDate ? (
            <View style={styles.row}>
              <CaptionBoldText numberOfLines={1} style={{ flexShrink: 1, marginLeft: UI_SIZES.spacing.small }}>
                {props.commentAuthor}
              </CaptionBoldText>
              <CaptionItalicText style={{ color: theme.palette.grey.graphite, marginLeft: UI_SIZES.spacing._LEGACY_small }}>
                {typeof props.commentDate === 'string' ? props.commentDate : displayPastDate(props.commentDate)}
              </CaptionItalicText>
            </View>
          ) : null}
          {
            Platform.select({
              android: textInputComponent,
              ios: <View style={textInputStyle}>{textInputComponent}</View>,
            })!
          }
        </View>
        {!isIdleExistingComment ? (
          <View style={{ alignSelf: 'flex-end', marginLeft: UI_SIZES.spacing.minor }}>
            <PrimaryButton
              round
              iconRight={isEditing ? 'pictos-save' : 'pictos-send'}
              action={() => publishComment()}
              disabled={isEmpty(comment.trim()) || isCommentUnchanged()}
              loading={props.isPublishingComment}
            />
          </View>
        ) : null}
      </View>
      {isIdleExistingComment && isUserComment && (props.onPublishComment || props.onDeleteComment) ? (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          {props.onPublishComment ? (
            <TouchableOpacity onPress={() => editComment()}>
              <SmallBoldText style={{ color: theme.palette.primary.regular }}>{I18n.get('commentfield-modify')}</SmallBoldText>
            </TouchableOpacity>
          ) : null}
          {props.onDeleteComment ? (
            <TouchableOpacity onPress={() => deleteComment()}>
              <SmallBoldText style={{ color: theme.palette.primary.regular, marginLeft: UI_SIZES.spacing.medium }}>
                {I18n.get('common-delete')}
              </SmallBoldText>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : props.isManager || isUserComment ? (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          {props.onDeleteComment ? (
            <TouchableOpacity onPress={() => deleteComment()}>
              <SmallBoldText style={{ color: theme.palette.primary.regular, marginLeft: UI_SIZES.spacing.medium }}>
                {I18n.get('common-delete')}
              </SmallBoldText>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default React.forwardRef(CommentField);
