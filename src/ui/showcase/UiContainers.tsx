import * as React from "react";
import { Text, View } from "react-native";
import { TouchCard } from "../Card";
import { CircleNumber } from "../CircleNumber";
import { DateView } from "../DateView";
import glamorous from "glamorous-native"

/**
 * UiContaiers
 * Ui showcase set showing all containers
 */
const MarginTouchCard = glamorous(TouchCard)({ margin: 10 });

export default () => (
    <View>
        <Text>Ui Contaiers</Text>
        <MarginTouchCard>
            <Text>Card and TouchCard (with custom margin)</Text>
        </MarginTouchCard>
        <CircleNumber nb={33}/>
        <DateView date={Date.now()} short={false}/>
    </View>
);