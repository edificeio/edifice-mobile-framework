import styled from '@emotion/native';
import I18n from 'i18n-js';
import * as React from 'react';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';
import { Line } from '~/ui/Grid';
import { Toggle } from '~/ui/forms/Toggle';

const Container = styled(TouchableOpacity)({
  alignItems: 'center',
  backgroundColor: theme.ui.background.card,
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
        <SmallText style={{ flex: 1, color: theme.ui.text.light, textAlignVertical: 'center' }}>
          {I18n.t(i18nKey.replace('.', '-'))}
        </SmallText>
        <Toggle checked={value} onCheck={() => onCheck()} onUncheck={() => onUncheck()} />
      </Line>
    </Container>
  );
};
