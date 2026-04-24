import { HapticFeedbackTypes, trigger } from 'react-native-haptic-feedback';

enum FeedbackType {
  ACTION_DONE,
  ERROR_DISPLAYED,
  TAB_PRESSED,
  LONG_PRESS,
}

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: true,
};

const HapticFeebackType: Record<FeedbackType, HapticFeedbackTypes> = {
  [FeedbackType.ACTION_DONE]: HapticFeedbackTypes.impactHeavy,
  [FeedbackType.ERROR_DISPLAYED]: HapticFeedbackTypes.notificationError,
  [FeedbackType.TAB_PRESSED]: HapticFeedbackTypes.effectClick,
  [FeedbackType.LONG_PRESS]: HapticFeedbackTypes.longPress,
};

export default class Feedback {
  private static feedback(type: FeedbackType) {
    // Haptic feedback
    trigger(HapticFeebackType[type], options);
  }

  static actionDone() {
    this.feedback(FeedbackType.ACTION_DONE);
  }

  static errorDisplayed() {
    this.feedback(FeedbackType.ERROR_DISPLAYED);
  }

  static tabPressed() {
    this.feedback(FeedbackType.TAB_PRESSED);
  }

  static warningDisplayed() {
    this.feedback(FeedbackType.ERROR_DISPLAYED);
  }

  static longPress() {
    this.feedback(FeedbackType.LONG_PRESS);
  }
}
