import * as React from "react";
import Pdf from "react-native-pdf";

import { CommonStyles } from "../../styles/common/styles";
import theme from "../util/theme";
import { BackdropModal } from "./backdropModal";

export interface IBackdropPdfReaderProps {
  handleClose: () => void;
  handleOpen: () => void;
  headerColor?: colorValue;
  indicatorColor?: colorValue;
  title?: string;
  uri: string;
  visible: boolean;
}

export const BackdropPdfReader = ({
  handleOpen,
  handleClose,
  headerColor,
  indicatorColor,
  title,
  uri,
  visible,
}: IBackdropPdfReaderProps) => (
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
    headerColor={headerColor}
    indicatorColor={indicatorColor}
    propagateSwipe
    title={title}
    visible={visible}
  />
);
