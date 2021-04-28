/**
 * ODE Mobile UI - Header
 * Build Headers components for React Navigation or for custom hand-made screens.
 */

import * as React from "react";
import { ViewProps, View, TouchableOpacity, ViewStyle } from "react-native";
import styled from '@emotion/native'
import { SafeAreaView } from "react-native";

import theme from "../util/theme";
import { Icon } from "./icon";
import { FontWeight, rem, TextInverse } from "./text";

const HeaderMinHeight = 52;

const FakeHeader_StyleComponent = styled.View({
    flexDirection: "row", alignItems: "center", flex: 0,
    backgroundColor: theme.color.secondary.regular,
    elevation: 5,
});

export const FakeHeader = (props: React.PropsWithChildren<ViewProps>) => <FakeHeader_StyleComponent>
    <SafeAreaView style={{width: "100%", height: "100%"}}>
        {props.children}
    </SafeAreaView>
</FakeHeader_StyleComponent>

export const HeaderRow = styled.View({
    minHeight: HeaderMinHeight,
    flexDirection: "row", alignItems: "center"
})

export const HeaderLeft = styled(HeaderRow)({
    position: "absolute",
    left: 0,
    height: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    zIndex:1
})
export const HeaderRight = styled(HeaderRow)({
    position: "absolute",
    right: 0,
    height: "100%",
    flexDirection: "row",
    alignItems:  "stretch",
    zIndex: 1
})
export const HeaderCenter = styled.View({
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: HeaderMinHeight
});

const iconSpecificSizes = {
    close: 16
};
const iconDefaultSize = 20;

export const HeaderIcon = (props: {
    name: string | null,
    hidden?: boolean,
    iconSize?: number,
    primary?: boolean,
}) => {
    const HeaderIconView = props.primary
        ? styled.View({
            height: 50, width: 50,
            marginTop: 20, marginRight: 20,
            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
            borderRadius: 30,
            backgroundColor: theme.color.secondary.regular,
            alignItems: "center",
            justifyContent: "center",
        })
        : styled.View({
            height: HeaderMinHeight, width: 60,
            flex: 0,
            alignItems: "center",
            justifyContent: "center",
        });

    return <HeaderIconView>
        <Icon
            size={props.iconSize || (props.name ? iconSpecificSizes[props.name as string] : iconDefaultSize) || iconDefaultSize}
            name={props.name}
            color={props.hidden ? "transparent" : "#FFFFFF"}
        />
    </HeaderIconView>;
}

interface IHeaderActionCommonProps {
    onPress?: () => void,
    disabled?: boolean,
    style?: ViewStyle
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
    justifyContent: "center",
    alignItems: "center"
})

export const HeaderAction = (props: IHeaderActionGenericProps | IHeaderActionCustomProps) => {
    const ActionComponent: React.ComponentClass<ViewProps> = props.disabled ? View : TouchableOpacity;
    return <ActionComponent
        {...props.disabled ? { onPress: props.onPress && props.onPress() } : {}}
        style={{ flex: 0, justifyContent: "center", ...(props.disabled ? { opacity: 0.7 } : {}), ...props.style }}
    >
        {(props as IHeaderActionCustomProps).customComponent
            ? (props as IHeaderActionCustomProps).customComponent
            : <>
                {(props as IHeaderActionGenericProps).iconName ? <HeaderIcon
                    name={(props as IHeaderActionGenericProps).iconName || null}
                    iconSize={(props as IHeaderActionGenericProps).iconSize}
                    hidden={(props as IHeaderActionGenericProps).hidden}
                /> : null}
                {(props as IHeaderActionGenericProps).text ? <HeaderActionText>
                    {(props as IHeaderActionGenericProps).text}
                </HeaderActionText> : null}
            </>
        }
    </ActionComponent>
}

export const HeaderTitle = styled(TextInverse)({
    textAlign: "center",
    textAlignVertical: "center",
    fontWeight: FontWeight.Bold,
    fontSize: rem(16/14)
});
export const HeaderSubtitle = styled(HeaderTitle)({
    fontWeight: FontWeight.Normal,
    fontSize: rem(14/14)
});
