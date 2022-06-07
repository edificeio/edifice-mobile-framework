import styled from '@emotion/native';
import moment from 'moment';
import * as React from 'react';
import { ViewStyle } from 'react-native';

import { Text, TextSizeStyle } from '~/framework/components/text';
import { displayPastDate } from '~/framework/util/date';
import { CommonStyles } from '~/styles/common/styles';

const ViewDate = styled.View<{ min: boolean }>(
  {
    alignItems: 'center',
    height: 20,
  },
  ({ min }): ViewStyle => ({
    marginBottom: min ? -2 : 4,
  }),
);

export const DateView = ({ date, min = false, strong = false }) => (
  <ViewDate min={min}>
    <Text style={[{ color: strong ? CommonStyles.textColor : CommonStyles.lightTextColor }, !strong && { ...TextSizeStyle.Small }]}>
      {displayPastDate(moment(date))}
    </Text>
  </ViewDate>
);
