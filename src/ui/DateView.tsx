import style from 'glamorous-native';
import moment from 'moment';
import * as React from 'react';
import { ViewStyle } from 'react-native';

import { Paragraph } from './Typography';

import { displayPastDate } from '~/framework/util/date';
import { layoutSize } from '~/styles/common/layoutSize';
import { CommonStyles } from '~/styles/common/styles';

const ViewDate = style.view(
  {
    alignItems: 'center',
    height: 20,
  },
  ({ min }): ViewStyle => ({
    marginBottom: min ? -2 : 4,
  }),
);

export const DateView = ({ date, min = false, strong = false }) => {
  return (
    <ViewDate min={min}>
      <Paragraph
        strong={strong}
        style={{
          fontSize: min ? layoutSize.LAYOUT_10 : undefined,
          color: strong ? CommonStyles.textColor : CommonStyles.lightTextColor,
        }}>
        {displayPastDate(moment(date))}
      </Paragraph>
    </ViewDate>
  );
};
