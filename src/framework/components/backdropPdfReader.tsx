import * as React from "react";
import Pdf from "react-native-pdf";

import { CommonStyles } from "../../styles/common/styles";
import theme from "../util/theme";
import { BackdropModal } from "./backdropModal";

export interface IBackdropPdfReaderProps {
  handleClose: () => void;
  handleOpen: () => void;
  uri: string;
  visible: boolean;
}

export const BackdropPdfReader = ({ handleOpen, handleClose, uri, visible }: IBackdropPdfReaderProps) => (
  <BackdropModal
    content={
      <Pdf
        activityIndicatorProps={{
          color: theme.color.tertiary.regular,
          progressTintColor: CommonStyles.mainColorTheme,
        }}
        source={{ cache: true, uri }}
        style={{ flex: 1, backgroundColor: theme.color.tertiary.light }}
      />
    }
    contentStyle={{ height: "90%" }}
    handleClose={handleClose}
    handleOpen={handleOpen}
    propagateSwipe
    visible={visible}
  />
);
