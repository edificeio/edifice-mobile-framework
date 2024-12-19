import { Platform } from 'react-native';

import { trigger } from 'react-native-haptic-feedback';

enum FeedbackType {
  ACTION_DONE,
  ERROR_DISPLAYED,
  TAB_PRESSED,
}

const HapticFeebackType = {
  [FeedbackType.ACTION_DONE]: Platform.select({ default: 'impactHeavy', ios: 'impactHeavy' }),
  [FeedbackType.ERROR_DISPLAYED]: Platform.select({ default: 'notificationError', ios: 'notificationError' }),
  [FeedbackType.TAB_PRESSED]: Platform.select({ default: 'keyboardTap', ios: 'soft' }),
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

  static tabPressed() {
    this.feedback(FeedbackType.TAB_PRESSED);
  }

  static warningDisplayed() {
    this.feedback(FeedbackType.ERROR_DISPLAYED);
  }
}
