import * as React from "react"
import { View } from "react-native";
import { Title, SubTitle } from './Header';

export const ResourceTitle = ({ title, subTitle }: { title: string, subTitle: string }) => (
	<View style={{ justifyContent: 'center', flex: 1, height: 60 }}>
		<Title numberOfLines={2} style={{ lineHeight: 18 }}>{title}</Title>
		<SubTitle numberOfLines={1} style={{ lineHeight: 14 }}>{subTitle}</SubTitle>
	</View>
)