import * as React from 'react';
import { ActivityIndicator, TextStyle, View } from 'react-native';

import styled from '@emotion/native';

import theme from '~/app/theme';
import styles from '~/framework/components/buttons/line/styles';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { Svg, SvgIconName } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

export const ContainerView = styled.View({
  alignItems: 'center',
  backgroundColor: theme.ui.background.card,
  borderBottomWidth: 1,
  borderColor: theme.palette.grey.cloudy,
  flexDirection: 'row',
  height: 46,
  justifyContent: 'flex-start',
  paddingHorizontal: UI_SIZES.spacing.medium,
});

export const ContainerTextInput = styled.TextInput({
  alignItems: 'center',
  backgroundColor: theme.ui.background.card,
  borderBottomWidth: 1,
  borderColor: theme.palette.grey.cloudy,
  flexDirection: 'row',
  height: 46,
  justifyContent: 'flex-start',
  padding: UI_SIZES.spacing.medium,
});

const ButtonLineGroupContext = React.createContext({ first: true, last: true });

export const LineButton = ({
  disabled = false,
  icon,
  loading = false,
  onPress,
  showArrow = false,
  testID,
  textStyle,
  title,
}: {
  title: string;
  icon?: SvgIconName;
  onPress?: () => any;
  disabled?: boolean;
  loading?: boolean;
  showArrow?: boolean;
  textStyle?: TextStyle;
  testID?: string;
}) => {
  const { first = true, last = true } = React.useContext(ButtonLineGroupContext);
  const Container = !disabled ? TouchableOpacity : View;

  const renderArrow = () => {
    if (!showArrow || !onPress) return;
    if (loading)
      return (
        <ActivityIndicator color={theme.palette.primary.regular} size={UI_SIZES.dimensions.width.mediumPlus} style={styles.arrow} />
      );
    return (
      <Svg
        name="ui-rafterRight"
        width={UI_SIZES.dimensions.width.mediumPlus}
        height={UI_SIZES.dimensions.width.mediumPlus}
        fill={theme.palette.primary.regular}
        style={styles.arrow}
      />
    );
  };

  return (
    <Container onPress={onPress} disabled={loading || disabled} testID={testID}>
      <View style={[styles.container, first && styles.containerFirst, last && styles.containerLast]}>
        <View style={styles.iconText}>
          {icon && (
            <Svg
              style={styles.icon}
              name={icon}
              width={getScaleWidth(20)}
              height={getScaleWidth(20)}
              fill={theme.palette.grey.black}
            />
          )}
          <SmallText numberOfLines={1} style={[styles.text, { ...(textStyle ? textStyle : null) }]}>
            {title}
          </SmallText>
        </View>
        {renderArrow()}
      </View>
    </Container>
  );
};

export const ButtonLineGroup = ({ children }: React.PropsWithChildren) => {
  const { first = true, last = true } = React.useContext(ButtonLineGroupContext);

  const childrenArray = React.Children.toArray(children);
  const childrenNodes = childrenArray.map(
    React.useCallback(
      (node, index) => (
        <ButtonLineGroupContext.Provider value={{ first: first && index === 0, last: last && index === childrenArray.length - 1 }}>
          {node}
        </ButtonLineGroupContext.Provider>
      ),
      [childrenArray.length, first, last],
    ),
  );

  return <>{childrenNodes}</>;
};
