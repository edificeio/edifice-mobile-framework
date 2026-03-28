#import <React/RCTBridgeModule.h>
#import <ReactCommon/RCTTurboModule.h>
#import <AppSpecs/AppSpecs.h>

@interface BuildInfo : NSObject <RCTBridgeModule>
@end

@interface BuildInfo () <NativeBuildInfoSpec>
@end

@implementation BuildInfo

RCT_EXPORT_MODULE(BuildInfo)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(fetchInfo) {
  NSMutableDictionary *result = [NSMutableDictionary dictionary];
  NSDictionary *info = [[NSBundle mainBundle] infoDictionary];
  if (!info) return result;
  NSSet *allowedKeys = [NSSet setWithArray:@[
    @"BundleVersionType",
    @"BundleVersionOverride",
    @"CFBundleIdentifier"
  ]];
  [info enumerateKeysAndObjectsUsingBlock:^(id key, id value, BOOL *stop) {
    if ([allowedKeys containsObject:key]) result[key] = value;
  }];
  return [result copy];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeBuildInfoSpecJSI>(params);
}

@end
