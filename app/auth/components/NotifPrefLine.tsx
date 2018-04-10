import * as React from "react";
import style from "glamorous-native";
import { Line } from "../../ui";
import { Paragraph } from '../../ui/Typography';
import { Switch } from "react-native";

export const NotifPrefLine = ({ i18nKey, frequency }) => {
	return (
        <Line>
            <Paragraph>{ i18nKey }</Paragraph>
            <Switch value={ frequency.defaultFrequency === 'IMMEDIATE' } />
        </Line>
    );
}