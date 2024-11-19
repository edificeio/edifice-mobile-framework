import * as React from 'react';

import { connect } from 'react-redux';

import { RichEditorViewerProps } from './types';

import RichEditor from '~/framework/components/inputs/rich-text/editor/RichEditor';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import * as authSelectors from '~/framework/modules/auth/redux/selectors';

export const RichEditorViewer = connect(state => ({
  oneSessionId: authSelectors.oneSessionId(state),
}))((props: RichEditorViewerProps & { oneSessionId: AuthActiveAccount['tokens']['oneSessionId'] }) => {
  console.debug('[RichEditorViewer] Rendering with content:', props.content);
  return (
    <RichEditor disabled useContainer initialContentHTML={props.content} oneSessionId={props.oneSessionId} onLoad={props.onLoad} />
  );
});
