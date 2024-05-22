import * as React from 'react';
import { connect } from 'react-redux';

import RichEditor from '~/framework/components/inputs/rich-text/editor/RichEditor';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import * as authSelectors from '~/framework/modules/auth/redux/selectors';

import { RichEditorViewerProps } from './types';

export const RichEditorViewer = connect(state => ({
  oneSessionId: authSelectors.oneSessionId(state),
}))((props: RichEditorViewerProps & { oneSessionId: AuthActiveAccount['tokens']['oneSessionId'] }) => {
  React.useEffect(() => {
    console.debug('RichEditorViewer mounted');
  }, []);
  console.debug('RichEditorViewer rendered');

  return (
    <RichEditor disabled useContainer initialContentHTML={props.content} oneSessionId={props.oneSessionId} onLoad={props.onLoad} />
  );
});
