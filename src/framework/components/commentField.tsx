import I18n from 'i18n-js';
import { Moment } from 'moment';
import * as React from 'react';
import { Alert, LayoutChangeEvent, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

import theme from '~/app/theme';
import RoundButton from '~/framework/components/buttons/round';
import { UI_SIZES } from '~/framework/components/constants';
import { assertSession } from '~/framework/modules/auth/reducer';
import { displayPastDate } from '~/framework/util/date';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

import { CaptionBoldText, CaptionItalicText, SmallBoldText } from './text';

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
  onEditableLayoutHeight?: (val: number) => void;
  isManager?: boolean;
}

// STYLES =========================================================================================

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    borderColor: theme.palette.grey.pearl,
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flexDirection: 'column',
    alignItems: 'stretch',
    flex: 1,
  },
  textInputAndroid: {
    flexGrow: 1,
    color: theme.palette.grey.black,
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.mediumPlus,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tiny,
    textAlignVertical: 'center',
  },
  textInputIOS: {
    flexGrow: 1,
    color: theme.palette.grey.black,
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.mediumPlus,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
});

// COMPONENT ======================================================================================

const CommentField = (props: CommentFieldProps, ref) => {
  //  Due to Alert + Keyboard bug, we need to set/unset a flag when Alert is displayed/discarded
  let alertDisplayed = false;
  const resetAlertDisplay = () => setTimeout(() => (alertDisplayed = false), 1000);
  const inputRef: { current: TextInput | undefined } = React.useRef();

  const session = useSelector(() => assertSession());
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
      setTimeout(() => {
        // Kinda a hack, but works...
        inputRef.current && inputRef.current.focus();
      });
    }
  }, [isEditing]);

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
        padding: props.commentId ? UI_SIZES.spacing.medium : undefined,
        borderTopWidth: props.commentId && isFirstComment ? 1 : 0,
        borderBottomWidth: props.commentId ? 1 : 0,
        backgroundColor: theme.ui.background.card,
      },
    ],
    [isFirstComment, props.commentId],
  );

  const textInputStyle = React.useMemo(
    () => [
      Platform.select({ ios: styles.textInputIOS, android: styles.textInputAndroid }),
      {
        maxHeight: isIdleExistingComment ? undefined : UI_SIZES.elements.textFieldMaxHeight,
        borderWidth: isIdleExistingComment ? 0 : 1,
        marginLeft: isIdleExistingComment ? UI_SIZES.spacing.small : UI_SIZES.spacing.small,
        marginTop: isIdleExistingComment ? UI_SIZES.spacing.tiny : 0,
        // 'paddingVertical seems odd on iOS, better use of paddingBottom only'
        [Platform.select({ ios: 'paddingBottom', android: 'paddingVertical' })!]: isIdleExistingComment
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
        placeholder={I18n.t(`common.${props.isResponse ? 'response' : 'comment'}.add`)}
        placeholderTextColor={theme.palette.grey.graphite}
        multiline
        scrollEnabled={!(props.isPublishingComment || isIdleExistingComment)}
        editable={!(props.isPublishingComment || isIdleExistingComment)}
        onChangeText={text => setComment(text)}
        value={comment}
        style={Platform.select({
          ios: undefined,
          android: textInputStyle,
        })}
      />
    ),
    [comment, isIdleExistingComment, props.isPublishingComment, props.isResponse, textInputStyle],
  );

  return (
    <View style={wrapperStyle} onLayout={onLayoutCallback}>
      {/* 1st row : comment content // editor */}
      <View style={[styles.row, { alignItems: props.commentId ? 'flex-start' : 'flex-end' }]}>
        <SingleAvatar size={isIdleExistingComment ? 24 : 36} userId={props.commentAuthorId || session.user.id} />
        <View style={styles.col}>
          {isIdleExistingComment && props.commentAuthor && props.commentDate ? (
            <View style={styles.row}>
              <CaptionBoldText numberOfLines={1} style={{ marginLeft: UI_SIZES.spacing.small, flexShrink: 1 }}>
                {props.commentAuthor}
              </CaptionBoldText>
              <CaptionItalicText style={{ marginLeft: UI_SIZES.spacing._LEGACY_small, color: theme.palette.grey.graphite }}>
                {typeof props.commentDate === 'string' ? props.commentDate : displayPastDate(props.commentDate)}
              </CaptionItalicText>
            </View>
          ) : null}
          {
            Platform.select({
              ios: <View style={textInputStyle}>{textInputComponent}</View>,
              android: textInputComponent,
            })!
          }
        </View>
        {!isIdleExistingComment ? (
          <View style={{ marginLeft: UI_SIZES.spacing.minor, alignSelf: 'flex-end' }}>
            <RoundButton
              iconName={isEditing ? 'pictos-save' : 'pictos-send'}
              action={() => publishComment()}
              disabled={!comment || isCommentUnchanged()}
              loading={props.isPublishingComment}
            />
          </View>
        ) : null}
      </View>
      {isIdleExistingComment && isUserComment && (props.onPublishComment || props.onDeleteComment) ? (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          {props.onPublishComment ? (
            <TouchableOpacity onPress={() => editComment()}>
              <SmallBoldText style={{ color: theme.palette.primary.regular }}>{I18n.t('common.modify')}</SmallBoldText>
            </TouchableOpacity>
          ) : null}
          {props.onDeleteComment ? (
            <TouchableOpacity onPress={() => deleteComment()}>
              <SmallBoldText style={{ color: theme.palette.primary.regular, marginLeft: UI_SIZES.spacing.medium }}>
                {I18n.t('common.delete')}
              </SmallBoldText>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : props.isManager ? (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          {props.onDeleteComment ? (
            <TouchableOpacity onPress={() => deleteComment()}>
              <SmallBoldText style={{ color: theme.palette.primary.regular, marginLeft: UI_SIZES.spacing.medium }}>
                {I18n.t('common.delete')}
              </SmallBoldText>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default React.forwardRef(CommentField);
