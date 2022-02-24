/**
 * ODE Mobile UI - Header
 * Build Headers components for React Navigation or for custom hand-made screens.
 *
 * Usage :
 * Use <FakeHeader_Container> component by giving these props :
 * - left: React Nodes to place into the left part
 * - right: React Nodes to place into the right part
 * - title: React Nodes OR string to place at the center of the header
 * every additional viewProp will be forwarded to the container
 *
 * If `children` prop is given, it will override all `left`, `right` and `title` props.
 */

import styled from '@emotion/native';
import * as React from 'react';
import { Platform, TextProps, TouchableOpacity, View, ViewProps, ViewStyle } from 'react-native';
import { NavigationScreenProp, NavigationParams, NavigationActions } from 'react-navigation';

import { UI_SIZES } from './constants';
import theme from '~/app/theme';
import { Icon } from './icon';
import { FontWeightIOS, rem, TextInverse } from './text';

/**
 * FakeHeader_Container
 */

export const FakeHeader_Container = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  flex: 0,
  backgroundColor: theme.color.secondary.regular,
  elevation: 5,
  minHeight: UI_SIZES.headerHeight + UI_SIZES.topInset,
  paddingTop: UI_SIZES.topInset,
});
export const FakeHeader_Row = styled.View({
  minHeight: UI_SIZES.headerHeight,
  flexDirection: 'row',
  alignItems: 'center',
});

export interface FakeHeaderProps extends ViewProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  title?: React.ReactNode | string;
}
export const FakeHeader = (props: React.PropsWithChildren<FakeHeaderProps>) => {
  const { left, right, title, ...viewProps } = props;
  return (
    <FakeHeader_Container {...viewProps}>
      <FakeHeader_Row>
        {left ? <HeaderLeft>{left}</HeaderLeft> : null}
        {title ? <HeaderCenter>{typeof title === 'string' ? <HeaderTitle>{title}</HeaderTitle> : title}</HeaderCenter> : null}
        {right ? <HeaderRight>{right}</HeaderRight> : null}
      </FakeHeader_Row>
    </FakeHeader_Container>
  );
};

export const HeaderLeft = styled(FakeHeader_Row)({
  position: 'absolute',
  left: 0,
  height: '100%',
  flexDirection: 'row',
  alignItems: 'stretch',
  zIndex: 1,
});
export const HeaderRight = styled(FakeHeader_Row)({
  position: 'absolute',
  right: 0,
  height: '100%',
  flexDirection: 'row',
  alignItems: 'stretch',
  zIndex: 1,
});
export const HeaderCenter = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: UI_SIZES.headerHeight,
  marginHorizontal: 60,
});

const iconSpecificSizes = {
  close: 16,
};
const iconDefaultSize = 20;

export const HeaderIcon = (props: { name: string | null; hidden?: boolean; iconSize?: number; primary?: boolean }) => {
  const HeaderIconView = props.primary
    ? styled.View({
        height: 50,
        width: 50,
        marginTop: 20,
        marginRight: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderRadius: 30,
        backgroundColor: theme.color.secondary.regular,
        alignItems: 'center',
        justifyContent: 'center',
      })
    : styled.View({
        height: UI_SIZES.headerHeight,
        width: 60,
        flex: 0,
        alignItems: 'center',
        justifyContent: 'center',
      });

  return (
    <HeaderIconView>
      <Icon
        size={props.iconSize || (props.name ? iconSpecificSizes[props.name as string] : iconDefaultSize) || iconDefaultSize}
        name={props.name}
        color={props.hidden ? 'transparent' : '#FFFFFF'}
      />
    </HeaderIconView>
  );
};

interface IHeaderActionCommonProps {
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}
interface IHeaderActionGenericProps extends IHeaderActionCommonProps {
  text?: string;
  iconName?: string | null;
  iconSize?: number;
  hidden?: boolean;
}
interface IHeaderActionCustomProps extends IHeaderActionCommonProps {
  customComponent?: JSX.Element;
}

const HeaderActionText = styled(TextInverse)({
  paddingHorizontal: 18,
  justifyContent: 'center',
  alignItems: 'center',
});

export const HeaderAction = (props: IHeaderActionGenericProps | IHeaderActionCustomProps) => {
  const ActionComponent: React.ComponentClass<ViewProps> = props.disabled ? View : TouchableOpacity;
  return (
    <ActionComponent
      {...(props.disabled ? {} : { onPress: props.onPress })}
      style={{ flex: 0, justifyContent: 'center', ...(props.disabled ? { opacity: 0.7 } : {}), ...props.style }}>
      {(props as IHeaderActionCustomProps).customComponent ? (
        (props as IHeaderActionCustomProps).customComponent
      ) : (
        <>
          {(props as IHeaderActionGenericProps).iconName ? (
            <HeaderIcon
              name={(props as IHeaderActionGenericProps).iconName || null}
              iconSize={(props as IHeaderActionGenericProps).iconSize}
              hidden={(props as IHeaderActionGenericProps).hidden}
            />
          ) : null}
          {(props as IHeaderActionGenericProps).text ? (
            <HeaderActionText>{(props as IHeaderActionGenericProps).text}</HeaderActionText>
          ) : null}
        </>
      )}
    </ActionComponent>
  );
};

export const HeaderBackAction = ({
  navigation,
  onPress,
}: {
  navigation?: NavigationScreenProp<NavigationParams>;
  onPress?: () => void;
}) => (
  <HeaderAction
    iconName={Platform.OS === 'ios' ? 'chevron-left1' : 'back'}
    iconSize={24}
    onPress={onPress ? onPress : navigation ? () => navigation.dispatch(NavigationActions.back()) : () => {}}
  />
);

export const HeaderTitle_Style = styled(TextInverse)({
  textAlign: 'center',
  textAlignVertical: 'center',
  fontWeight: FontWeightIOS.Bold,
  fontSize: rem(16 / 14),
});
export const HeaderTitle = (props: TextProps) => {
  return <HeaderTitle_Style numberOfLines={1} {...props} />;
};
export const HeaderSubtitle_Style = styled(HeaderTitle_Style)({
  fontWeight: FontWeightIOS.Normal,
  fontSize: rem(14 / 14),
});
export const HeaderSubtitle = (props: TextProps) => {
  return <HeaderSubtitle_Style numberOfLines={1} {...props} />;
};
