import React from 'react';

import theme from '~/app/theme';

import { Icon } from './Icon';

export const SearchIcon = () => <Icon size={22} name={'search'} color={theme.ui.text.inverse} />;

export const CloseIcon = () => <Icon size={22} name={'close'} color={theme.ui.text.inverse} />;
