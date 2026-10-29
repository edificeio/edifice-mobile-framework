#import <UIKit/UIKit.h>
#import <objc/runtime.h>

/**
 * Gives the native navigation bar title a stable accessibility identifier, so e2e tests don't depend on the displayed text.
 * Without it, the title element's `name` is the title itself.
 *
 * Only applies to the native title (`UINavigationItem.title`): a custom `titleView` (React `headerTitle`) owns its `testID`.
 * Android equivalent: `resource-id` set in the `react-native-screens` patch.
 */
static NSString *const kNavigationBarTitleIdentifier = @"header-title";

@implementation UINavigationBar (TitleIdentifier)

+ (void)load
{
  Method original = class_getInstanceMethod(self, @selector(layoutSubviews));
  Method swizzled = class_getInstanceMethod(self, @selector(appe_titleIdentifier_layoutSubviews));
  method_exchangeImplementations(original, swizzled);
}

static BOOL IsInsideBarButton(UIView *view, UIView *bar)
{
  static Class BarButtonClass;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    BarButtonClass = NSClassFromString(@"_UIButtonBarButton");
  });
  for (UIView *ancestor = view.superview; ancestor != nil && ancestor != bar; ancestor = ancestor.superview) {
    if ([ancestor isKindOfClass:BarButtonClass]) {
      return YES;
    }
  }
  return NO;
}

/**
 * Finds the label displaying the title. When the label is wrapped in a control (newer iOS versions),
 * the identifier is also set on it, as it may be the element exposed to accessibility.
 */
static void ApplyTitleIdentifier(UIView *view, UINavigationBar *bar, NSString *title)
{
  for (UIView *subview in view.subviews) {
    if ([subview isKindOfClass:[UILabel class]] && [((UILabel *)subview).text isEqualToString:title]
        && !IsInsideBarButton(subview, bar)) {
      subview.accessibilityIdentifier = kNavigationBarTitleIdentifier;
      UIView *parent = subview.superview;
      if ([parent isKindOfClass:[UIControl class]]) {
        parent.accessibilityIdentifier = kNavigationBarTitleIdentifier;
      }
    } else {
      ApplyTitleIdentifier(subview, bar, title);
    }
  }
}

- (void)appe_titleIdentifier_layoutSubviews
{
  [self appe_titleIdentifier_layoutSubviews]; // original implementation (methods are exchanged)

  UINavigationItem *item = self.topItem;
  if (item == nil || item.titleView != nil || item.title.length == 0) {
    return;
  }
  ApplyTitleIdentifier(self, self, item.title);
}

@end
