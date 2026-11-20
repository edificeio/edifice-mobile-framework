import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { genericHitSlop, UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { CaptionBoldText } from '~/framework/components/text';

import styles from './styles';
import { DiscussionRepliesBarProps } from './types';

const ICON_SIZE = UI_SIZES.elements.icon.xsmall;

const DiscussionRepliesBar = ({ onPressLatestReply, repliesCount }: Readonly<DiscussionRepliesBarProps>) => (
  <View style={styles.root}>
    <View style={styles.repliesCount}>
      <Svg fill={theme.palette.grey.graphite} height={ICON_SIZE} name="ui-messageInfo" width={ICON_SIZE} />
      <CaptionBoldText style={styles.repliesCountText}>
        {I18n.get(repliesCount === 1 ? 'communities-discussioncard-response' : 'communities-discussioncard-responses', {
          count: repliesCount,
        })}
      </CaptionBoldText>
    </View>
    {onPressLatestReply ? (
      <TouchableOpacity
        hitSlop={genericHitSlop}
        onPress={onPressLatestReply}
        style={styles.latestReplyButton}
        testID="discussion-latest-reply">
        <Svg fill={theme.palette.grey.black} height={ICON_SIZE} name="ui-arrowDown" width={ICON_SIZE} />
        <CaptionBoldText style={styles.latestReplyText}>{I18n.get('communities-discussion-latest-reply')}</CaptionBoldText>
      </TouchableOpacity>
    ) : null}
  </View>
);

export default DiscussionRepliesBar;
