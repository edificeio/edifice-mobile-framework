import * as React from 'react';

import RichEditor from '~/framework/components/inputs/rich-text/editor/RichEditor';

import { RichEditorViewerProps } from './types';

export const RichEditorViewer = (props: RichEditorViewerProps) => {
  return <RichEditor disabled useContainer initialContentHTML={props.content} />;
};
