import React from 'react';
import { StyleSheet, View } from 'react-native';

import { I18n } from '~/app/i18n';
import { UI_SIZES } from '~/framework/components/constants';
import { HeadingSText } from '~/framework/components/text';
import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import { CarnetDeBordWidget } from '~/framework/modules/widgets/carnet-de-board/components/home-widget';
import { canSeeCarnetDeBordWidget } from '~/framework/modules/widgets/carnet-de-board/rights';

import { WidgetsSectionProps } from './types';

export const hasWidgets = (session: AuthActiveAccount) => canSeeCarnetDeBordWidget(session);

export const WidgetsSection = React.memo(({ session }: WidgetsSectionProps) => {
  if (!hasWidgets(session)) return null;

  return (
    <View style={styles.section}>
      <HeadingSText>{I18n.get('home-widgets-title')}</HeadingSText>
      <CarnetDeBordWidget session={session} />
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    gap: UI_SIZES.spacing.minor,
  },
});
