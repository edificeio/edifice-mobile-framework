import styled from '@emotion/native';
import I18n from 'i18n-js';
import * as React from 'react';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';
import { Line } from '~/ui/Grid';
import { Label } from '~/ui/Typography';
import { Toggle } from '~/ui/forms/Toggle';

const Container = styled(TouchableOpacity)({
  alignItems: 'center',
  backgroundColor: 'white',
  borderBottomWidth: 1,
  borderColor: theme.palette.grey.cloudy,
  flexDirection: 'row',
  height: 46,
  justifyContent: 'flex-start',
});

export const NotifPrefLine = ({ i18nKey, value, onCheck, onUncheck }) => {
  return (
    <Container
      style={{
        marginBottom: UI_SIZES.spacing.small,
        marginTop: UI_SIZES.spacing.small,
        paddingHorizontal: UI_SIZES.spacing.medium,
      }}
      onPress={() => (value ? onUncheck() : onCheck())}>
      <Line style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Label style={{ flex: 1 }}>{I18n.t(i18nKey.replace('.', '-'))}</Label>
        <Toggle checked={value} onCheck={() => onCheck()} onUncheck={() => onUncheck()} />
      </Line>
    </Container>
  );
};
