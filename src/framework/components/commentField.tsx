import I18n from 'i18n-js';
import * as React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

import theme from '~/app/theme';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';
import { getUserSession, IUserSession } from '../util/session';
import { LoadingIndicator } from './loading';
import { TextAction } from './text';

// TYPES ==========================================================================================

export interface ICommentField_DataProps {
  isPublishingComment: boolean;
}
export interface ICommentField_EventProps {
  onPublishComment: (comment: string) => any;
}
export type ICommentField_Props = ICommentField_DataProps & ICommentField_EventProps;

// COMPONENT ======================================================================================

const CommentField = (props: ICommentField_Props, ref) => {
  const inputRef: { current: TextInput | undefined } = React.useRef();
  const session = useSelector((state) => getUserSession(state));
  const [ comment, setComment ] = React.useState<string>('');
  const [ publishButtonWidth, setPublishButtonWidth ] = React.useState<number | undefined>();
  const onPublish = () => {
    inputRef.current && inputRef.current.blur();
    props.onPublishComment(comment);
  };
  const clearCommentField = () => {
    inputRef.current && inputRef.current.clear();
    setComment('');
  };
  React.useImperativeHandle(ref, () => ({ clearCommentField }));

  return (
    <View
      style={{
        backgroundColor: theme.color.background.card,
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12
      }}
    >
      <SingleAvatar userId={session.user.id} />
      <View
        style={{
          flex: 1,
          height: '100%',
          padding: 12,
          marginLeft: 12,
          maxHeight: 120,
          borderRadius: 20,
          borderWidth: 0.5,
          borderColor: theme.color.inputBorder,
          flexDirection: 'row',
          alignItems: 'flex-end'
        }}
      >
        <TextInput
          ref={inputRef}
          style={{ flex: 1, marginRight: 12, paddingTop: 0 }}
          placeholder={I18n.t('common.comment.addComment')}
          onChangeText={(text) => setComment(text)}
          editable={!props.isPublishingComment}
          multiline
        />
        <View
          style={{ height: 20, width: publishButtonWidth }}
          onLayout={(e) => {
            const publishButtonWidth = e.nativeEvent.layout.width;
            setPublishButtonWidth(publishButtonWidth);
          }}
        >
          {props.isPublishingComment ? (
            <LoadingIndicator small />
          ) : (
            <TouchableOpacity onPress={() => onPublish()} disabled={!comment}>
              <TextAction style={{ opacity: !comment ? 0.5 : 1 }}>{I18n.t('common.publish')}</TextAction>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default React.forwardRef(CommentField);
