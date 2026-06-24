import * as React from 'react';
import { View } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { useCurvedNavBarFeature } from '~/framework/hooks/curved-navbar';
import ResourceDescription from '~/framework/modules/wiki/components/resource-description';
import ResourceHeaderLoader from '~/framework/modules/wiki/components/resource-header-loader';
import ResourceThumbnail from '~/framework/modules/wiki/components/resource-thumbnail';

import styles from './styles';
import { ResourceHeaderProps } from './types';

const ResourceHeader: React.FC<ResourceHeaderProps> = ({ canAddDescription = false, description, image }) => {
  const [isCardExpanded, setIsCardExpanded] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const navBarDecoration = useCurvedNavBarFeature({
    height: 575,
    name: 'ui-wiki-list-header',
    topOffset: -524,
    width: 375,
  });
  const headerContainerStyle = React.useMemo(() => {
    return [
      styles.resourceHeaderContainer,
      { marginBottom: description ? UI_SIZES.spacing.big : UI_SIZES.spacing.large + UI_SIZES.spacing.tiny },
    ];
  }, [description]);

  const toggleLoadingState = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    if (isLoading) {
      toggleLoadingState();
    }
  }, [isLoading, toggleLoadingState]);

  if (isLoading) {
    return <ResourceHeaderLoader />;
  }

  return (
    <View style={headerContainerStyle}>
      {navBarDecoration}
      <Svg
        width={getScaleWidth(75)}
        height={getScaleWidth(124)}
        style={styles.svgShapeLeft}
        fill={theme.palette.primary.light}
        name="ui-edifice-shape-arc"
      />
      <Svg
        width={getScaleWidth(57)}
        height={getScaleWidth(114)}
        style={styles.svgShapeRight}
        fill={theme.palette.primary.light}
        name="ui-edifice-shape-half-circle"
      />
      <View style={styles.thumbnailAndCardContainer}>
        <ResourceThumbnail source={image} />
        {description && <ResourceDescription content={description} expanded={isCardExpanded} onPress={setIsCardExpanded} />}
      </View>
    </View>
  );
};

export default ResourceHeader;
