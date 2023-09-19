import * as React from 'react';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { RichToolbarButton } from '~/framework/components/inputs/rich-text-editor/rich-toolbar-button';
import { NamedSVG } from '~/framework/components/picture';

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
