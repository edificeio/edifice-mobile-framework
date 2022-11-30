import styled from '@emotion/native';
import I18n from 'i18n-js';
import * as React from 'react';

import { ButtonTextIcon } from './ButtonTextIcon';

export interface ButtonsOkProps {
  onValid: () => void;
  title: string;
}
export interface ButtonsOkCancelProps {
  onCancel: () => void;
  onValid: () => void;
  title: string;
  cancelText?: string;
}

const ButtonStyled = styled.View({
  flex: 0,
  flexGrow: 0,
  flexDirection: 'row',
  width: '100%',
});

export const ButtonsOkCancel = ({ onCancel, onValid, title, cancelText }: ButtonsOkCancelProps) => (
  <ButtonStyled>
    {/* FIXME: Should fire events instead of translating them down or use onPress={onValid} and onPress={onCancel}. */}
    <ButtonTextIcon onPress={() => onValid()} title={title} />
    <ButtonTextIcon onPress={() => onCancel()} title={cancelText || I18n.t('Cancel')} />
  </ButtonStyled>
);
export const ButtonsOkOnly = ({ onValid, title }: ButtonsOkProps) => (
  <ButtonStyled>
    {/* FIXME: Should fire events instead of translating them down or use onPress={onValid} and onPress={onCancel}. */}
    <ButtonTextIcon onPress={() => onValid()} title={title} />
  </ButtonStyled>
);
export const ButtonsOkCancelReverse = ({ onCancel, onValid, title, cancelText }: ButtonsOkCancelProps) => (
  <ButtonStyled>
    {/* FIXME: Should fire events instead of translating them down or use onPress={onValid} and onPress={onCancel}. */}
    <ButtonTextIcon onPress={() => onCancel()} title={cancelText || I18n.t('Cancel')} />
    <ButtonTextIcon onPress={() => onValid()} title={title} />
  </ButtonStyled>
);
