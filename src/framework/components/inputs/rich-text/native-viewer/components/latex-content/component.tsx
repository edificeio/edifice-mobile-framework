import * as React from 'react';

import { EnrichedMarkdownText, LatexErrorEvent } from 'react-native-enriched-markdown';

import { LATEX_MARKDOWN_STYLE } from './styles';
import { LatexContentProps } from './types';

const LatexContent = ({ latex }: Readonly<LatexContentProps>) => {
  const [failedLatex, setFailedLatex] = React.useState<string>();
  const hasLatexError = failedLatex === latex;
  // A formula the LaTeX engine cannot render is displayed as inline code
  const markdown = React.useMemo(() => (hasLatexError ? `\`${latex}\`` : `$$\n${latex}\n$$`), [hasLatexError, latex]);
  const onLatexError = React.useCallback((_event: LatexErrorEvent) => setFailedLatex(latex), [latex]);

  return (
    <EnrichedMarkdownText
      flavor="github"
      markdown={markdown}
      markdownStyle={LATEX_MARKDOWN_STYLE}
      onLatexError={onLatexError}
      selectable={false}
      testID="rich-content-latex-content"
    />
  );
};

export default React.memo(LatexContent);
