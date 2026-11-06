import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';

import styles, { ATTACHMENT_ICON_SIZE } from './styles';
import { AttachmentPreviewProps } from './types';

const AttachmentPreview = ({ attachment, onPress }: Readonly<AttachmentPreviewProps>) => {
  const onPressAttachment = React.useCallback(() => onPress(attachment.href), [attachment.href, onPress]);

  return (
    <TouchableOpacity style={styles.container} onPress={onPressAttachment} testID="rich-content-attachment">
      <Svg name="ui-attachment" width={ATTACHMENT_ICON_SIZE} height={ATTACHMENT_ICON_SIZE} fill={theme.palette.grey.black} />
      <SmallText style={styles.name} numberOfLines={1} ellipsizeMode="middle">
        {attachment.name}
      </SmallText>
    </TouchableOpacity>
  );
};

export default React.memo(AttachmentPreview);
