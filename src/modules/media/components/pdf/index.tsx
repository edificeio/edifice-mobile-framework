import React from 'react';

import RNPdf, { type PdfRef, type PdfProps as RNPdfProps } from 'react-native-pdf';

import { type SignedSourceProps, useSignedSource } from '~/modules/media/source';

export type { PdfRef };
export type PdfProps = RNPdfProps & SignedSourceProps & { ref?: React.Ref<PdfRef> };

/**
 * Bridge of `Pdf` of react-native-pdf: same component, which signs its `source`.
 */
export const Pdf = ({ account, signed, source, ...props }: PdfProps) => {
  const signedSource = useSignedSource(source, { account, signed });
  return <RNPdf {...props} source={signedSource} />;
};
