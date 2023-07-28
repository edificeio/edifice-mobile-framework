import styled from '@emotion/native';
import * as React from 'react';
import * as ReactIs from 'react-is';
import { ActivityIndicator, StyleProp, TextStyle, View } from 'react-native';

import theme from '~/app/theme';
import styles from '~/framework/components/buttons/lineIcon/styles';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

export const LineIconButton = ({
  text,
  icon,
  onPress,
  first = false,
  last = false,
  alone = false,
  textStyle,
  showArrow,
}: {
  text: string;
  icon: string;
  onPress?: () => any;
  first?: boolean;
  last?: boolean;
  alone?: boolean;
  textStyle?: TextStyle;
  showArrow?: boolean;
}) => {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container {...(onPress ? { onPress: onPress } : {})}>
      <View
        style={[
          styles.container,
          first ? styles.containerFirst : last ? styles.containerLast : alone ? styles.containerAlone : null,
        ]}>
        <View style={styles.iconText}>
          <NamedSVG
            style={styles.icon}
            name={icon}
            width={UI_SIZES.elements.icon}
            height={UI_SIZES.elements.icon}
            fill={theme.palette.grey.black}
          />
          <SmallText numberOfLines={1} style={[styles.text, { ...(textStyle ? textStyle : null) }]}>
            {text}
          </SmallText>
        </View>
        {onPress && showArrow ? (
          <NamedSVG
            name="ui-rafterRight"
            width={UI_SIZES.dimensions.width.mediumPlus}
            height={UI_SIZES.dimensions.height.mediumPlus}
            fill={theme.palette.grey.black}
            style={styles.arrow}
          />
        ) : null}
      </View>
    </Container>
  );
};

export const ButtonLineIconGroup = ({
  children,
  allowFirst = true,
  allowLast = true,
  allowAlone = true,
}: React.PropsWithChildren & { allowFirst?: boolean; allowLast?: boolean; allowAlone?: boolean }) => {
  const childrenAsArray = React.Children.toArray(children); // We use `childrenAsArray` instead of `count` to ignore empty/null/undefined nodes.
  const mapFunction = (node: Parameters<Parameters<typeof childrenAsArray.map>[0]>[0], index: number) => {
    if (ReactIs.isFragment(node)) {
      return (
        <ButtonLineIconGroup
          allowFirst={index === 0}
          allowLast={index === childrenAsArray.length - 1}
          allowAlone={childrenAsArray.length === 1}>
          {/* must cast this as ReactElement becasue ReactFragment type doesn't allow props (even though props does exist)*/}
          {(node as React.ReactElement).props.children}
        </ButtonLineIconGroup>
      );
    } else if (ReactIs.isElement(node)) {
      return (
        <LineIconButton
          {...((node as React.ReactElement).props ?? {})}
          first={allowFirst && (childrenAsArray.length > 1 || !allowAlone) && index === 0}
          last={allowLast && (childrenAsArray.length > 1 || !allowAlone) && index === childrenAsArray.length - 1}
          alone={allowAlone && childrenAsArray.length === 1}
          key={(node as React.ReactElement).key}
        />
      );
    } else return node;
  };
  return <>{childrenAsArray.map(mapFunction)}</>;
};
