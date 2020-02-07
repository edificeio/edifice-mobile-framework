import I18n from "i18n-js";
import * as React from "react";
import { Text, View } from "react-native";
import { LayoutEvent } from "react-navigation";
import rnTextSize, { TSMeasureParams, TSMeasureResult } from "react-native-text-size"
import { A } from "./Typography";
import { contentStyle } from "../myAppMenu/components/NewContainerContent";

export interface ITextPreviewProps {
  textContent: string;
  textStyle?: object;
  numberOfLines?: number;
  isCollapsable?: boolean;
  onExpand?: () => void;
  expandMessage?: string;
  collapseMessage?: string;
  expansionTextStyle?: object;
}

interface ITextPreviewState {
  longText: boolean;
  measuredText: boolean;
  isExpanded: boolean;
}

export class TextPreview extends React.PureComponent<
  ITextPreviewProps,
  ITextPreviewState
> {
  state = {
    longText: false,
    measuredText: false,
    isExpanded: false,
  }

  public measureText = (numberOfLines: number) => async (evt: LayoutEvent) => {
    this.setState({ measuredText: true })
    if (evt.nativeEvent.lines.length >= numberOfLines) {
      const layout = evt.nativeEvent.lines[numberOfLines-1];
      const text = layout.text
      const {fontFamily, fontSize, fontWeight } = contentStyle
      const result: TSMeasureResult = await rnTextSize.measure({
        text,
        fontFamily,
        fontSize,
        fontWeight
      } as TSMeasureParams);
      if (layout.width + 1 < result.width) {
        this.setState({ longText: true })
      }
    }
  }

  public renderExpansionLabels() {
    const { 
      textContent,
      numberOfLines, // don't include "numberOfLines" prop when "textContent" is already cropped (HTML)
      isCollapsable,
      onExpand, // must include if no "numberOfLines" prop (no expansion possible)
      expandMessage,
      collapseMessage,
      expansionTextStyle
    } = this.props;
    const { longText, isExpanded } = this.state;
    const expand = expandMessage || I18n.t("seeMore");
    const collapse = collapseMessage || I18n.t("seeLess");
    const showExpansionLabels = !numberOfLines ? textContent.endsWith("...") : longText && (isCollapsable || !isExpanded);
    return showExpansionLabels && (
      <A
        style={expansionTextStyle}
        onPress={() => onExpand ? onExpand() : this.setState({ isExpanded: !isExpanded })}
      >
        {!numberOfLines && " "}{isExpanded ? collapse : expand}
      </A>
    )  
  }

  public render() {
    const { textContent, textStyle, numberOfLines } = this.props;
    const { measuredText, isExpanded } = this.state;
    return(
      <View>
        <Text
          style={textStyle}
          numberOfLines={!numberOfLines || isExpanded ? undefined : numberOfLines}
          onTextLayout={numberOfLines && !measuredText && this.measureText(numberOfLines)}
        >
          {textContent}
          {!numberOfLines && this.renderExpansionLabels()}
        </Text>
        {numberOfLines && this.renderExpansionLabels()}
      </View>
    )
  }
}
