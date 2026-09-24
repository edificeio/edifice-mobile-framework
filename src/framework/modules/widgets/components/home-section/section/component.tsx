import React from 'react';
import { StyleSheet, View } from 'react-native';

import { I18n } from '~/app/i18n';
import { UI_SIZES } from '~/framework/components/constants';
import { HeadingSText } from '~/framework/components/text';
import { getVisibleHomeWidgets } from '~/framework/modules/widgets/registry';

import { WidgetsHomeSectionProps } from './types';

export const WidgetsHomeSection = React.memo(({ session }: WidgetsHomeSectionProps) => {
  const widgets = React.useMemo(() => getVisibleHomeWidgets(session), [session]);

  return (
    <View style={styles.section}>
      <HeadingSText>{I18n.get('home-widgets-title')}</HeadingSText>
      {widgets.map(widget => (
        <React.Fragment key={widget.name}>{widget.renderComponent(session)}</React.Fragment>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    gap: UI_SIZES.spacing.minor,
  },
});
