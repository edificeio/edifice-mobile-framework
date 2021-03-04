/**
 * ODE Mobile UI - Page
 * Build Page components in a reusable way.
 */

import * as React from "react";
import { ViewProps } from "react-native";
import styled from '@emotion/native'

import theme from "../theme";
import DEPRECATED_ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";

const PageView_StyleComponent = styled.View({
    flex: 1,
    backgroundColor: theme.color.pageBackground
});

export const PageView = (props: React.PropsWithChildren<ViewProps>) => <PageView_StyleComponent>
    <DEPRECATED_ConnectionTrackingBar />
    {props.children}
</PageView_StyleComponent>
