import { Platform } from 'react-native';
import { trigger } from 'react-native-haptic-feedback';

enum FeedbackType {
  ERROR_DISPLAYED = 0,
  TAB_PRESSED = ERROR_DISPLAYED + 1,
}

const HapticFeebackType = [
  Platform.select({ ios: 'notificationError', default: 'notificationError' }), // FeedbackType.ERROR_DISPLAYED
  Platform.select({ ios: 'soft', default: 'keyboardTap' }), // FeedbackType.TAB_PRESSED
];

export default class Feedback {
  private static feedback(type: FeedbackType) {
    // Haptic feedback
    trigger(HapticFeebackType[type], {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: true,
    });
  }

  static errorDisplayed() {
    this.feedback(FeedbackType.ERROR_DISPLAYED);
  }

  static warningDisplayed() {
    this.feedback(FeedbackType.ERROR_DISPLAYED);
  }

  static tabPressed() {
    this.feedback(FeedbackType.TAB_PRESSED);
  }
}
