import * as React from "react";
import style from "glamorous-native";
import { Line } from "../../ui";
import { Paragraph, Label } from '../../ui/Typography';
import { Switch } from "react-native";
import { TouchCard } from "../../ui/Card";
import I18n from "react-native-i18n";
import { Toggle } from "../../ui/forms/Toggle";

const Container = style.touchableOpacity({
	alignItems: 'center',
	flexDirection: 'row',
	backgroundColor: 'white',
	borderBottomWidth: 1,
	borderColor: '#ddd',
	height: 46,
	justifyContent: 'flex-start'
});

export const NotifPrefLine = ({ i18nKey, value, onCheck, onUncheck }) => {
	return (
        <Container style={{ marginBottom: 10, marginTop: 10, paddingHorizontal: 20 }} onPress={ () => value ? onUncheck() : onCheck() }>
            <Line style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Label style={{ flex: 1 }}>{ I18n.t(i18nKey.replace('.', '-')) }</Label>
                <Toggle checked={ value } onCheck={ () => onCheck() } onUncheck={ () => onUncheck() } />
            </Line>
        </Container>
    );
}