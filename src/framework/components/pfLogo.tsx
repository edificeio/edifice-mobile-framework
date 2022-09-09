/**
 * ODE Mobile UI - Logo
 * Display current platform logo
 */
import styled from '@emotion/native';
import React from 'react';

import { Picture } from '~/framework/components//picture';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';

const logoHeight = 64;
const logoWidth = 300;

const ImageLogo = styled.Image({
  height: logoHeight,
  resizeMode: 'contain',
  width: logoWidth,
});

export const PFLogo = () => {
  const pf = DEPRECATED_getCurrentPlatform()!;
  return pf?.logoType === 'NamedSvg' ? (
    <Picture type="NamedSvg" name={pf.logo} height={logoHeight} width={logoWidth} />
  ) : (
    <ImageLogo source={pf.logo} />
  );
};
