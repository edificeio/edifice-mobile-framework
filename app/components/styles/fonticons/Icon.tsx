import * as React from "react"
import { Text, StyleSheet } from 'react-native';

import Icons from './Font';

export interface IconProps {
    style: any
    color: any,
    children?: any
}

const Icon = ({ style, color, children, ...props } : IconProps)  =>
    <Text {...props} style={[styles.icon, { color }, style]}>
        {children}
    </Text>


const styles = StyleSheet.create({
    icon: {
        fontFamily:       'OpenSans',
        backgroundColor:  'transparent',
    },
});

export { Icon, Icons };
