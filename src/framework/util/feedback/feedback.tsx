import { Platform } from 'react-native';
import { trigger } from 'react-native-haptic-feedback';

enum FeedbackType {
  ACTION_DONE,
  ERROR_DISPLAYED,
  TAB_PRESSED,
}

const HapticFeebackType = {
  ACTION_DONE: Platform.select({ ios: 'soft', default: 'keyboardTap' }),
  ERROR_DISPLAYED: Platform.select({ ios: 'notificationError', default: 'notificationError' }),
  TAB_PRESSED: Platform.select({ ios: 'soft', default: 'keyboardTap' }),
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
