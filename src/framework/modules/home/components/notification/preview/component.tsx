import * as React from 'react';
import { View } from 'react-native';

import { Svg, SvgIconName } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { MediaPreview } from '~/framework/modules/home/components/media-preview';
import blockStyles from '~/framework/modules/home/components/styles';

import { PREVIEW_ICON_SIZE, PREVIEW_TEXT_LINES, PREVIEW_TITLE_LINES } from '../constants';
import styles from './styles';
import { NotificationPreviewProps } from './types';

export const NotificationPreview = React.memo(({ badge, colors, media, resourceName, text, title }: NotificationPreviewProps) => {
  const color = badge?.color;
  const blockStyle = React.useMemo(
    () => [blockStyles.block, styles.block, colors ? { backgroundColor: colors.pale } : null],
    [colors],
  );

  return (
    <View style={blockStyle}>
      <View style={blockStyles.blockHeader}>
        {badge?.icon ? (
          <Svg name={badge.icon as SvgIconName} fill={color} width={PREVIEW_ICON_SIZE} height={PREVIEW_ICON_SIZE} />
        ) : null}
        <SmallBoldText style={styles.name} numberOfLines={1}>
          {resourceName}
        </SmallBoldText>
      </View>
      <View style={blockStyles.blockBody}>
        {title ? <SmallBoldText numberOfLines={PREVIEW_TITLE_LINES}>{title}</SmallBoldText> : null}
        {text ? (
          <SmallText style={styles.text} numberOfLines={PREVIEW_TEXT_LINES}>
            {text}
          </SmallText>
        ) : null}
        <MediaPreview media={media} withVideos />
      </View>
    </View>
  );
});
