import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText } from '~/framework/components/text';
import { DISCUSSION_STATUS_CONFIG } from '~/framework/modules/communities/utils';

import styles, { TAB_STYLES } from './styles';
import { DiscussionStatusTabProps } from './types';

const HIDDEN_STATUS = 'hidden';

const DiscussionStatusTab = ({ status, type }: Readonly<DiscussionStatusTabProps>) => {
  if (!status) return null;
  const { i18nKey, icon } = DISCUSSION_STATUS_CONFIG[status];

  return (
    <View style={styles.clip}>
      <View style={[TAB_STYLES[type], status === HIDDEN_STATUS ? styles.dashedBorder : null]}>
        <Svg
          fill={theme.palette.grey.graphite}
          height={UI_SIZES.elements.icon.small}
          name={icon}
          width={UI_SIZES.elements.icon.small}
        />
        <SmallBoldText style={styles.text}>{I18n.get(i18nKey)}</SmallBoldText>
      </View>
    </View>
  );
};

export default React.memo(DiscussionStatusTab);
