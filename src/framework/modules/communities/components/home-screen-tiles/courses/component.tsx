import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { CoursesTileProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import Pill from '~/framework/components/pill';
import { SmallBoldText } from '~/framework/components/text';
import { wikiRouteNames } from '~/framework/modules/wiki/navigation';

const CoursesTile = ({ navigation, spotlightedCourseId }: CoursesTileProps) => {
  const navigateToSpotlightedCourse = React.useCallback(() => {
    if (spotlightedCourseId) {
      navigation.navigate(wikiRouteNames.summary, { resourceId: spotlightedCourseId });
    } /* TO DO : empty screen si pas de cours à la une dans le else*/
  }, [navigation, spotlightedCourseId]);

  const Wrapper = spotlightedCourseId ? TouchableOpacity : View;

  return (
    <Wrapper
      style={spotlightedCourseId ? styles.tileCoursesAvailable : styles.tileCoursesUnavailable}
      onPress={navigateToSpotlightedCourse}>
      <View style={styles.tileCaption}>
        <Svg
          name="ui-text-page"
          width={UI_SIZES.elements.icon.small}
          height={UI_SIZES.elements.icon.small}
          fill={spotlightedCourseId ? styles.tileCaptionTextAvailable.color : styles.tileCaptionTextUnavailable.color}
        />
        <SmallBoldText style={spotlightedCourseId ? styles.tileCaptionTextAvailable : styles.tileCaptionTextUnavailable}>
          {I18n.get('communities-tile-courses-title')}
        </SmallBoldText>
      </View>
      {!spotlightedCourseId && <Pill text={I18n.get('communities-tile-soon')} color={theme.palette.grey.stone} />}
    </Wrapper>
  );
};

export default CoursesTile;
