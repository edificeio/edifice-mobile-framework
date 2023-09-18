import * as React from 'react';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';

import { RichToolbarButton } from '../component';
import { RichToolbarIconButtonProps } from './types';

export const RichToolbarIconButton = (props: RichToolbarIconButtonProps) => {
  return (
    <RichToolbarButton
      {...props}
      content={
        <NamedSVG
          name={props.icon}
          fill={theme.palette.grey.black}
          height={UI_SIZES.elements.icon.small}
          width={UI_SIZES.elements.icon.small}
        />
      }
    />
  );
};
