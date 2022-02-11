/**
 * ODE Mobile UI - Logo
 * Display current platform logo
 */
import style from 'glamorous-native';
import React from 'react';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';

const Logo = style.image({ height: 100, width: 300, resizeMode: 'contain' });

export const PFLogo = () => <Logo source={DEPRECATED_getCurrentPlatform()!.logo} />;
