import * as React from 'react';

import { RichEditorNativeViewer } from '~/framework/components/inputs/rich-text/native-viewer';

import { RichEditorViewerProps } from './types';

export const RichEditorViewer = ({ content, onLoad }: Readonly<RichEditorViewerProps>) => {
  React.useEffect(() => {
    onLoad?.();
  }, [content, onLoad]);

  return <RichEditorNativeViewer content={content} />;
};
