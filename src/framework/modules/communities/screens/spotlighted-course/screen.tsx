import * as React from 'react';
import { ScrollView } from 'react-native';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import ActionCard from '~/framework/components/card/action/component';
import { useCurvedNavBarFeature } from '~/framework/hooks/curved-navbar';
import { openUrl } from '~/framework/util/linking';

import styles from './styles';
import { CommunitiesSpotlightedCourseScreen } from './types';

export const SpotlightedCourseScreenOptions = screenOptions(() => ({
  headerShadowVisible: false,
  title: I18n.get('communities-spotlightedcourse-title'),
}));

const SpotlightedCourseScreen = ({ route }: CommunitiesSpotlightedCourseScreen.AllProps) => {
  const navBarDecoration = useCurvedNavBarFeature({
    height: 575,
    name: 'ui-wiki-list-header',
    topOffset: -524,
    width: 375,
  });
  const { communityId, platformUrl } = route.params;
  const spotlightedCourseUrl = `${platformUrl}/communities/id/${communityId}/courses`;

  const redirectToWeb = React.useCallback(() => {
    openUrl(spotlightedCourseUrl);
  }, [spotlightedCourseUrl]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {navBarDecoration}
      <ActionCard
        actionIcon="ui-plus"
        actionText={I18n.get('communities-spotlightedcourse-create-action')}
        description={I18n.get('communities-spotlightedcourse-create-description')}
        picture="course-create"
        testId={'communities-spotlightedcourse-create'}
        title={I18n.get('communities-spotlightedcourse-create-title')}
        onAction={redirectToWeb}
      />
      <ActionCard
        actionIcon="ui-link"
        actionText={I18n.get('communities-spotlightedcourse-link-action')}
        description={I18n.get('communities-spotlightedcourse-link-description')}
        picture="course-link"
        testId={'communities-spotlightedcourse-link'}
        title={I18n.get('communities-spotlightedcourse-link-title')}
        onAction={redirectToWeb}
      />
    </ScrollView>
  );
};

export default SpotlightedCourseScreen;
