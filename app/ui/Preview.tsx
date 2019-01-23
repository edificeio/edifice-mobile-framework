import I18n from "i18n-js";
import * as React from "react";
import { Text, View } from "react-native";
import { A, Paragraph } from "./Typography";

export const Preview = ({ textContent, onExpend }) => {
  const crop = (textContent as string).endsWith("...");
  /*

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

    */

  return (
    <View>
      <Paragraph>
        <Text>{textContent}</Text>
        {crop && <A onPress={() => onExpend()}>{I18n.t("seeMore")}</A>}
      </Paragraph>
    </View>
  );
};
