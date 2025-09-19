import * as React from 'react';
import { View } from 'react-native';

import styles from './styles';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import Pill from '~/framework/components/pill';
import { SmallBoldText } from '~/framework/components/text';

const CoursesTile = () => (
  <View style={styles.tileCourses}>
    <View style={styles.tileCaption}>
      <Svg
        name="ui-text-page"
        width={UI_SIZES.elements.icon.small}
        height={UI_SIZES.elements.icon.small}
        fill={styles.tileCaptionTextUnavailable.color}
      />
      <SmallBoldText style={styles.tileCaptionTextUnavailable}>{I18n.get('communities-tile-courses-title')}</SmallBoldText>
    </View>
    <Pill text={I18n.get('communities-tile-soon')} color={theme.palette.grey.stone} />
  </View>
);

export default CoursesTile;
