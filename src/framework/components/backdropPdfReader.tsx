import * as React from "react";
import { View, ColorValue } from "react-native";
import Pdf from "react-native-pdf";
import I18n from "i18n-js";

import { CommonStyles } from "../../styles/common/styles";
import theme from "../util/theme";
import { BackdropModal } from "./backdropModal";
import { Text, TextBold } from "../../framework/components/text";

import EmptyPdf from "ode-images/empty-screen/empty-pdf.svg";

export interface IBackdropPdfReaderProps {
  handleClose: () => void;
  handleOpen: () => void;
  headerColor?: ColorValue;
  indicatorColor?: ColorValue;
  title?: string;
  uri: string;
  visible: boolean;
}

export interface IBackdropPdfReaderState {
  error: boolean;
}

export class BackdropPdfReader extends React.PureComponent<IBackdropPdfReaderProps, IBackdropPdfReaderState> {

  // DECLARATIONS =================================================================================

  state: IBackdropPdfReaderState = {
    error: false
  }

  // RENDER =======================================================================================

  render() {
    const { handleOpen, handleClose, headerColor, indicatorColor, title, uri, visible } = this.props;
    const { error } = this.state;
    return (
      <BackdropModal
        content={error
          ? <View style={{ flex: 1, backgroundColor: theme.color.tertiary.light, alignItems: "center" }}>
              <EmptyPdf style={{ aspectRatio: 1, maxHeight: "40%", maxWidth: "70%", marginBottom: 30, marginTop: "10%" }}/> 
              <TextBold style={{ fontSize: 18, marginBottom: 20 }}>{I18n.t("common.error.title")}</TextBold>
              <Text style={{ textAlign: "center" }}>{I18n.t("common.error.pdf.text")}</Text>
            </View>
          : <Pdf
              activityIndicatorProps={{
                color: theme.color.tertiary.regular,
                progressTintColor: CommonStyles.mainColorTheme,
              }}
              source={{ cache: true, uri }}
              style={{ flex: 1, backgroundColor: theme.color.tertiary.light }}
              onError={err => {
                // Note: when the backdrop is dimissed, the "uri" prop becomes undefined and onError activates;
                // therefore, we only use setState if the modal is displayed (the "visible" prop is true).
                console.log("error (backdropPdfReader):", err);
                visible && this.setState({ error: true });
              }}
            />
        }
        contentStyle={{ height: "90%" }}
        handleClose={handleClose}
        handleOpen={handleOpen}
        headerColor={headerColor}
        indicatorColor={indicatorColor}
        propagateSwipe
        title={title}
        visible={visible}
      />
    );
  }
}
