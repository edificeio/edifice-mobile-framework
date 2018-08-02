/**
 * Just display a grey vertical line at the left tall as the screen is.
 */
import style from "glamorous-native";
import { CommonStyles } from "../../styles/common/styles";

export const HomeworkTimeline = style.view({
  backgroundColor: CommonStyles.entryfieldBorder, // TODO: Use the linear gradient instead of a plain grey
  height: "100%",
  left: 29,
  position: "absolute",
  width: 1
});

export default HomeworkTimeline;
