import * as React from 'react';

import { I18n } from '~/app/i18n';
import SecondaryButton from '~/framework/components/buttons/secondary';
import redirect from '~/framework/modules/widgets/carnet-de-board/service/redirect';

import styles from './styles';
import { CarnetDeBordPronoteButtonProps } from './types';

export function CarnetDeBordPronoteButton({ address, pageId, session, style }: CarnetDeBordPronoteButtonProps) {
  const open = React.useCallback(() => {
    if (address) redirect(session, address, pageId);
  }, [address, pageId, session]);

  if (!address) return null;

  return (
    <SecondaryButton
      style={[styles.button, style]}
      action={open}
      iconRight="pictos-external-link"
      text={I18n.get('pronote-openinpronote')}
    />
  );
}
