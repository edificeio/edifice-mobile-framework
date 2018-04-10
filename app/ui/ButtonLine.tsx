import style from "glamorous-native"
import * as React from "react";
import { RowProperties } from "../ui/index";
import I18n from 'react-native-i18n';

const Container = style.touchableOpacity({
	alignItems: 'center',
	flexDirection: 'row',
	backgroundColor: 'white',
	borderBottomWidth: 1,
	borderColor: '#ddd',
	height: 46,
	justifyContent: 'flex-start',
	marginTop: 20,
	paddingHorizontal: 13
});

const LinkStyle = style.text({
	fontSize: 14,
}, ({ color }) => ({
	color: color || '#000'
}));

export const ButtonLine = ({ onPress, title, color }: { onPress: () => any, title: string, color?: string }) => (
	<Container onPress={() => onPress()}>
		<LinkStyle color={ color }>{ I18n.t(title) }</LinkStyle>
	</Container>
)
