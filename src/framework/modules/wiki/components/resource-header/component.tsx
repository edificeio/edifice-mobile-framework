import * as React from 'react';
import { View } from 'react-native';

import styles from './styles';
import { ResourceHeaderProps } from './types';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import ResourceDescription from '~/framework/modules/wiki/components/resource-description';
import { styles as descriptionStyle } from '~/framework/modules/wiki/components/resource-description/styles';
import ResourceHeaderLoader from '~/framework/modules/wiki/components/resource-header-loader';
import ResourceThumbnail from '~/framework/modules/wiki/components/resource-thumbnail';

const DESCRIPTION_TEXT_WIDTH =
  UI_SIZES.screen.width - descriptionStyle.cardContainer.marginHorizontal * 2 - descriptionStyle.cardContainer.padding * 2;

// height of the svg file we need to withdraw from the view but still needed in positionning calculation
// depends on the original dimensions and content of the svg file
const HEADER_SVG_TOP_OFFSET = -524;

/**
 * Setup a fancy navBar decoration feature
 * That consists of adding a svg as a background that scroll with the page content
 * @returns the React Element of the decoration
 */
function useCurvedNavBarFeature() {
  // SVG size management
  const svgDisplayWidth = UI_SIZES.screen.width;
  const svgDisplayHeight = Math.ceil(
    svgDisplayWidth * (useCurvedNavBarFeature.svgOriginalHeight / useCurvedNavBarFeature.svgOriginalWidth),
  );
  const svgDisplayTopOffset = HEADER_SVG_TOP_OFFSET * (svgDisplayWidth / useCurvedNavBarFeature.svgOriginalWidth);
  // Math.ceil(navBarHeight * (svgDisplayWidth / useCurvedNavBarFeature.svgOriginalWidth)) -
  // svgDisplayHeight +
  // UI_SIZES.elements.statusbarHeight;
  // SVG size management

  return React.useMemo(() => {
    return (
      <Svg
        width={svgDisplayWidth}
        height={svgDisplayHeight}
        style={[styles.navBarSvgDecoration, { top: svgDisplayTopOffset }]}
        fill={theme.palette.primary.regular}
        name="ui-wiki-list-header"
      />
    );
  }, [svgDisplayHeight, svgDisplayTopOffset, svgDisplayWidth]);
}

useCurvedNavBarFeature.svgOriginalWidth = 375;
useCurvedNavBarFeature.svgOriginalHeight = 575;
useCurvedNavBarFeature.svgDisplayTopOffsetTolerance = 2;

const ResourceHeader: React.FC<ResourceHeaderProps> = ({ canAddDescription = false, description, image }) => {
  const [isCardExpanded, setIsCardExpanded] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const navBarDecoration = useCurvedNavBarFeature();

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
        <ResourceThumbnail {...image} />
        {description && (
          <ResourceDescription
            content={description}
            expanded={isCardExpanded}
            onToggleVisibility={setIsCardExpanded}
            textWidth={DESCRIPTION_TEXT_WIDTH}
          />
        )}
      </View>
    </View>
  );
};

export default ResourceHeader;
