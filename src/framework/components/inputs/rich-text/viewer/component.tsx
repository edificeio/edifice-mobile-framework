import * as React from 'react';

import { useNavigation } from '@react-navigation/native';
import { connect } from 'react-redux';

import RichEditor from '~/framework/components/inputs/rich-text/editor/RichEditor';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import * as authSelectors from '~/framework/modules/auth/redux/selectors';

import { RichEditorViewerProps } from './types';

export const RichEditorViewer = connect(state => ({
  oneSessionId: authSelectors.oneSessionId(state),
}))((props: RichEditorViewerProps & { oneSessionId: AuthActiveAccount['tokens']['oneSessionId'] }) => {
  // console.debug('[RichEditorViewer] Rendering with content:', props.content);
  const navigation = useNavigation();
  return (
    <RichEditor
      navigation={navigation}
      disabled
      useContainer
      initialContentHTML={props.content}
      oneSessionId={props.oneSessionId}
      onLoad={props.onLoad}
    />
  );
});
