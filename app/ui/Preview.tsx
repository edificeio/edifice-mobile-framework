import * as React from "react"
import { View, Text } from "react-native";
import { Paragraph, A } from "./Typography";
import I18n from "i18n-js";

export const Preview = ({ textContent, onExpend }) => {
    let crop = false;
    let previewText = textContent;
    if (previewText.length > 175) {
        previewText = previewText.substring(0, 172) + "... ";
        crop = true;
    }
    const spliced = previewText.split('\n');
    if(spliced.length >= 4){
        previewText = spliced.splice(0,4).join('\n') + '... ';
        crop = true;
    }

    return (
        <View>
            <Paragraph>
                <Text onLayout={ e => console.log(e) }>{ previewText }</Text>
                { crop && <A onPress={ () => onExpend() }>{ I18n.t("seeMore") }</A> }
            </Paragraph>
        </View>
    )
}