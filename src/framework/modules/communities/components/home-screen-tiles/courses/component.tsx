import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { MembershipRole } from '@edifice.io/community-client-rest-rn';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import Pill from '~/framework/components/pill';
import { SmallBoldText } from '~/framework/components/text';
import { communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { wikiRouteNames } from '~/framework/modules/wiki/navigation';

import styles from './styles';
import { CoursesTileProps } from './types';

const CoursesTile = ({ communityId, navigation, platformUrl, spotlightedCourseId, userRole }: CoursesTileProps) => {
  const isUnavailable = !spotlightedCourseId;

  const navigateToSpotlightedCourse = React.useCallback(() => {
    if (!isUnavailable) {
      navigation.navigate(wikiRouteNames.summary, { resourceId: spotlightedCourseId });
    }

    if (isUnavailable && userRole === MembershipRole.ADMIN) {
      navigation.navigate(communitiesRouteNames.spotlightedCourse, { communityId, platformUrl });
    }
  }, [isUnavailable, userRole, navigation, spotlightedCourseId, communityId, platformUrl]);

  const isMember = userRole === MembershipRole.MEMBER;
  const Wrapper = !userRole || (isUnavailable && isMember) ? View : TouchableOpacity;
  const tileStyle = isUnavailable && isMember ? styles.tileCoursesUnavailable : styles.tileCoursesAvailable;
  const captionTextStyle = isUnavailable && isMember ? styles.tileCaptionTextUnavailable : styles.tileCaptionTextAvailable;
  const pillColor = isUnavailable && isMember ? theme.palette.grey.stone : theme.palette.grey.white;
  const pillTextColor = isUnavailable && isMember ? theme.palette.grey.white : theme.palette.primary.regular;

  return (
    <Wrapper style={tileStyle} onPress={navigateToSpotlightedCourse}>
      <View style={styles.tileCaption}>
        <Svg
          name="ui-text-page"
          width={UI_SIZES.elements.icon.small}
          height={UI_SIZES.elements.icon.small}
          fill={captionTextStyle.color}
        />
        <SmallBoldText style={captionTextStyle}>{I18n.get('communities-tile-courses-title')}</SmallBoldText>
      </View>
      {isUnavailable && (
        <Pill
          color={pillColor}
          italic={isUnavailable && !isMember}
          text={I18n.get('communities-tile-courses-courseless')}
          textColor={pillTextColor}
        />
      )}
    </Wrapper>
  );
};

export default CoursesTile;
