import style from "glamorous-native";
import * as React from "react";
import { View, ActivityIndicator } from "react-native";
import { CommonStyles } from "../styles/common/styles";

export const Loading = () => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={ CommonStyles.primary } />
    </View>
);