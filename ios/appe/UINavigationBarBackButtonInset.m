#import <UIKit/UIKit.h>
#import <objc/runtime.h>

/**
 * Without Liquid Glass (compatibility look), the native back button is stuck to the screen edge.
 * This shifts it towards the content by a few points, keeping the native button (icon, long-press menu, ...).
 *
 * Liquid Glass can't be opted out when the app is built with the iOS 27 SDK *and* runs on iOS 27.
 * In every other case (older SDK, or older runtime with `UIDesignRequiresCompatibility`), it is disabled.
 */
static const CGFloat kCompatBackButtonLeadingOffset = 12.0;

static BOOL IsLiquidGlassDisabled(void)
{
#if defined(__IPHONE_27_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_27_0
  if (@available(iOS 27.0, *)) {
    return NO;
  }
#endif
  return YES;
}

@implementation UINavigationBar (BackButtonInset)

+ (void)load
{
  if (!IsLiquidGlassDisabled()) {
    return;
  }
  Method original = class_getInstanceMethod(self, @selector(layoutSubviews));
  Method swizzled = class_getInstanceMethod(self, @selector(appe_layoutSubviews));
  method_exchangeImplementations(original, swizzled);
}

- (BOOL)appe_isDisplayingNativeBackButton
{
  UINavigationItem *item = self.topItem;
  if (self.backItem == nil || item == nil || item.hidesBackButton) {
    return NO;
  }
  return item.leftBarButtonItems.count == 0 || item.leftItemsSupplementBackButton;
}

/**
 * Finds the bar button view at the leading edge of the bar: when the native back button is displayed, it is the first one.
 * `react-native-screens`' own finder is not used: it looks for the iOS 26 content view class, which doesn't exist
 * when Liquid Glass is disabled (compatibility look).
 */
static void FindLeadingBarButton(UIView *view, UINavigationBar *bar, UIView *__strong *leading, CGFloat *leadingX)
{
  static Class BarButtonClass;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    BarButtonClass = NSClassFromString(@"_UIButtonBarButton");
  });
  for (UIView *subview in view.subviews) {
    if ([subview isKindOfClass:BarButtonClass]) {
      CGRect frame = [subview convertRect:subview.bounds toView:bar];
      CGFloat x = bar.effectiveUserInterfaceLayoutDirection == UIUserInterfaceLayoutDirectionRightToLeft
          ? -CGRectGetMaxX(frame)
          : CGRectGetMinX(frame);
      if (*leading == nil || x < *leadingX) {
        *leading = subview;
        *leadingX = x;
      }
    } else {
      FindLeadingBarButton(subview, bar, leading, leadingX);
    }
  }
}

- (void)appe_layoutSubviews
{
  [self appe_layoutSubviews]; // original implementation (methods are exchanged)

  UIView *backButton = nil;
  CGFloat leadingX = 0;
  FindLeadingBarButton(self, self, &backButton, &leadingX);
  if (backButton == nil) {
    return;
  }
  if ([self appe_isDisplayingNativeBackButton]) {
    BOOL isRTL = self.effectiveUserInterfaceLayoutDirection == UIUserInterfaceLayoutDirectionRightToLeft;
    CGFloat offset = isRTL ? -kCompatBackButtonLeadingOffset : kCompatBackButtonLeadingOffset;
    backButton.transform = CGAffineTransformMakeTranslation(offset, 0);
  } else {
    backButton.transform = CGAffineTransformIdentity;
  }
}

@end
