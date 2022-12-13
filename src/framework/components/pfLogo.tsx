/**
 * ODE Mobile UI - Logo
 * Display current platform logo
 */
import styled from '@emotion/native';
import React from 'react';

import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { Platform } from '~/framework/util/appConf';

import { Image } from '../util/media';

const logoHeight = 64;
const logoWidth = 300;

const ImageLogo = styled(Image)({
  height: logoHeight,
  resizeMode: 'contain',
  width: logoWidth,
});

export const PFLogo = ({ pf }: { pf: Platform }) => {
  const { logoSize } = UI_SIZES.elements;
  return pf.logoType === 'NamedSvg' ? (
    <Picture type="NamedSvg" name={pf.logo} height={logoSize.height} width={logoSize.width} />
  ) : (
    <ImageLogo source={pf.logo} />
  );
};
