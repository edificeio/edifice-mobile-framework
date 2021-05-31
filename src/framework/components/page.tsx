/**
 * ODE Mobile UI - Page
 * Build Page components in a reusable way.
 */

import * as React from "react";
import { ViewProps } from "react-native";
import styled from '@emotion/native'

import theme from "../util/theme";
import DEPRECATED_ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import Notifier from "../util/notifier";

const PageView_StyleComponent = styled.View({
    flex: 1,
    backgroundColor: theme.color.background.page
});

export const PageView = (props: React.PropsWithChildren<ViewProps & { path?: string }>) => <PageView_StyleComponent>
    <DEPRECATED_ConnectionTrackingBar />
    {props.path ? <Notifier id={props.path} /> : null}
    {props.children}
</PageView_StyleComponent>
