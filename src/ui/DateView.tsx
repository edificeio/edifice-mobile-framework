import styled from '@emotion/native';
import moment from 'moment';
import * as React from 'react';
import { ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { Small, TextSizeStyle } from '~/framework/components/text';
import { displayPastDate } from '~/framework/util/date';

const ViewDate = styled.View<{ min: boolean }>(
  ({ min }): ViewStyle => ({
    marginBottom: min ? -2 : 4, // MO-142 use UI_SIZES.spacing here
  }),
);

export const DateView = ({ date, min = false, strong = false }) => (
  <ViewDate min={min}>
    <Small
      numberOfLines={1}
      style={[{ color: strong ? theme.ui.text.regular : theme.ui.text.light }, !strong && { ...TextSizeStyle.Small }]}>
      {displayPastDate(moment(date))}
    </Small>
  </ViewDate>
);
