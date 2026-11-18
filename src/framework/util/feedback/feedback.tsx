import { HapticFeedbackTypes, trigger } from 'react-native-haptic-feedback';

enum FeedbackType {
  ACTION_DONE,
  ERROR_DISPLAYED,
  TAB_PRESSED,
  LONG_PRESS,
  SELECTION_CHANGED,
}

const HapticFeebackType: Record<FeedbackType, HapticFeedbackTypes> = {
  [FeedbackType.ACTION_DONE]: HapticFeedbackTypes.impactHeavy,
  [FeedbackType.ERROR_DISPLAYED]: HapticFeedbackTypes.notificationError,
  [FeedbackType.TAB_PRESSED]: HapticFeedbackTypes.effectClick,
  [FeedbackType.LONG_PRESS]: HapticFeedbackTypes.longPress,
  // Not `selection`: the library plays it at 20% intensity on iOS, which can hardly be felt.
  [FeedbackType.SELECTION_CHANGED]: HapticFeedbackTypes.effectClick,
};

export default class Feedback {
  private static feedback(type: FeedbackType) {
    // Haptic feedback
    trigger(HapticFeebackType[type], {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: true,
    });
  }

  static actionDone() {
    this.feedback(FeedbackType.ACTION_DONE);
  }

  static errorDisplayed() {
    this.feedback(FeedbackType.ERROR_DISPLAYED);
  }

  static longPress() {
    this.feedback(FeedbackType.LONG_PRESS);
  }

  // Light tick, for a value or a position that changes step by step (picker, list reordering…).
  static selectionChanged() {
    this.feedback(FeedbackType.SELECTION_CHANGED);
  }

  static tabPressed() {
    this.feedback(FeedbackType.TAB_PRESSED);
  }

  static warningDisplayed() {
    this.feedback(FeedbackType.ERROR_DISPLAYED);
  }
}
