import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { INotificationMedia } from '~/framework/util/notifications';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText } from '~/framework/components/text';

export type AttachmentCountProps = {
  attachments: (INotificationMedia & { type: 'attachment' })[];
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.elements.border.thin,
  },
});

export function AttachmentCount({ attachments }: AttachmentCountProps) {
  return (
    <View style={styles.container}>
      <Svg
        name="ui-attachment"
        width={UI_SIZES.elements.icon.medium}
        height={UI_SIZES.elements.icon.medium}
        fill={theme.ui.text.regular}
      />
      <SmallBoldText>
        {attachments.length} {I18n.get(attachments.length > 1 ? 'attachment-attachments' : 'attachment-attachment')}
      </SmallBoldText>
    </View>
  );
}

export default AttachmentCount;
