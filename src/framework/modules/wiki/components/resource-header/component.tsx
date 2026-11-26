import * as React from 'react';
import { View } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { useCurvedNavBarFeature } from '~/framework/hooks/curved-navbar';
import WikiResourceDescription from '~/framework/modules/wiki/components/resource-description';
import WikiResourceThumbnail from '~/framework/modules/wiki/components/resource-thumbnail';

import styles from './styles';
import { WikiResourceHeaderProps } from './types';

const WikiResourceHeader: React.FC<WikiResourceHeaderProps> = ({ description, image }) => {
  const [isCardExpanded, setIsCardExpanded] = React.useState<boolean>(false);
  const navBarDecoration = useCurvedNavBarFeature({
    height: 575,
    name: 'ui-wiki-list-header',
    topOffset: -524,
    width: 375,
  });
  const headerContainerStyle = React.useMemo(
    () => [
      styles.resourceHeaderContainer,
      description ? styles.resourceHeaderContainerWithDescription : styles.resourceHeaderContainerWithoutDescription,
    ],
    [description],
  );

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
        <WikiResourceThumbnail source={image} />
        {description && <WikiResourceDescription content={description} expanded={isCardExpanded} onPress={setIsCardExpanded} />}
      </View>
    </View>
  );
};

export default WikiResourceHeader;
