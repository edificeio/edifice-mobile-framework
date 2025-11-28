import React from 'react';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';

const ItemOptions = () => {
  return (
    <Svg
      name="ui-options-horizontal"
      width={UI_SIZES.elements.icon.small}
      height={UI_SIZES.elements.icon.small}
      fill={theme.palette.grey.graphite}
    />
  );
};

export default ItemOptions;
