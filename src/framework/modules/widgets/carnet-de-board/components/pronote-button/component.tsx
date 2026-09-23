import * as React from 'react';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { I18n } from '~/app/i18n';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { UI_SIZES } from '~/framework/components/constants';
import redirect from '~/framework/modules/widgets/carnet-de-board/service/redirect';

import styles from './styles';
import { CarnetDeBordPronoteButtonProps } from './types';

export function CarnetDeBordPronoteButton({ address, pageId, session, style }: Readonly<CarnetDeBordPronoteButtonProps>) {
  const open = React.useCallback(() => {
    if (address) redirect(session, address, pageId);
  }, [address, pageId, session]);

  const { bottom } = useSafeAreaInsets();
  const buttonStyle = React.useMemo(
    () => [
      styles.button,
      {
        marginBottom: bottom
          ? UI_SIZES.spacing.large + UI_SIZES.spacing.big - bottom
          : UI_SIZES.spacing.large + UI_SIZES.spacing.medium,
      },
      style,
    ],
    [bottom, style],
  );

  if (!address) return null;

  return (
    <SecondaryButton style={buttonStyle} action={open} iconRight="pictos-external-link" text={I18n.get('pronote-openinpronote')} />
  );
}
