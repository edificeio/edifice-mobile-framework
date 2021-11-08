import I18n from "i18n-js";
import * as React from "react";
import { TextInput } from "react-native-gesture-handler";

export const Input = ({ value, onChange }: { value: string; onChange: (text: string) => void }) => {
  const textUpdateTimeout = React.useRef();
  const [currentValue, updateCurrentValue] = React.useState(value);

  React.useEffect(() => {
    window.clearTimeout(textUpdateTimeout.current);
    textUpdateTimeout.current = window.setTimeout(() => onChange(currentValue), 100);

    return () => {
      window.clearTimeout(textUpdateTimeout.current);
    };
  }, [currentValue]);

  return (
    <TextInput
      style={{ flex: 1, color: "#FFF", fontSize: 16 }}
      placeholder={I18n.t("Search")}
      placeholderTextColor="#FFF"
      numberOfLines={1}
      defaultValue={currentValue}
      onChangeText={text => updateCurrentValue(text)}
    />
  );
};
