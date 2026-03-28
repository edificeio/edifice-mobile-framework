#import <AppSpecs/AppSpecs.h>
#import "appe-Swift.h"

@interface ZendeskUnified : NSObject <NativeZendeskUnifiedSpec>
@end

@implementation ZendeskUnified {
  ZendeskUnifiedImpl *_impl;
}

RCT_EXPORT_MODULE()

- (instancetype)init {
  if (self = [super init]) {
    _impl = [ZendeskUnifiedImpl new];
  }
  return self;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeZendeskUnifiedSpecJSI>(params);
}

- (void)healthCheck:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  [_impl healthCheckWithResolve:resolve reject:reject];
}

- (void)initialize:(JS::NativeZendeskUnified::ZendeskConfig &)config
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  NSMutableDictionary *dict = [NSMutableDictionary new];
  if (config.appId()) dict[@"appId"] = config.appId();
  if (config.clientId()) dict[@"clientId"] = config.clientId();
  if (config.zendeskUrl()) dict[@"zendeskUrl"] = config.zendeskUrl();
  if (config.accountKey()) dict[@"accountKey"] = config.accountKey();
  [_impl initializeWithConfig:dict resolve:resolve reject:reject];
}

- (void)setAnonymousIdentity:(JS::NativeZendeskUnified::SetAnonymousIdentityOptions &)options
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  NSMutableDictionary *dict = [NSMutableDictionary new];
  if (options.email()) dict[@"email"] = options.email();
  if (options.name()) dict[@"name"] = options.name();
  [_impl setAnonymousIdentityWithOptions:dict resolve:resolve reject:reject];
}

- (void)setIdentity:(NSString *)jwt
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  [_impl setIdentityWithJwt:jwt resolve:resolve reject:reject];
}

- (void)openHelpCenter:(JS::NativeZendeskUnified::OpenHelpCenterOptions &)options
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  NSMutableDictionary *dict = [NSMutableDictionary new];
  if (options.groupType()) dict[@"groupType"] = options.groupType();
  if (options.showContactOptions().has_value()) dict[@"showContactOptions"] = @(options.showContactOptions().value());
  if (options.labels().has_value()) {
    auto labels = options.labels().value();
    NSMutableArray *arr = [NSMutableArray new];
    for (NSString *s : labels) [arr addObject:s];
    dict[@"labels"] = arr;
  }
  if (options.groupIds().has_value()) {
    auto groupIds = options.groupIds().value();
    NSMutableArray *arr = [NSMutableArray new];
    for (auto n : groupIds) [arr addObject:@(n)];
    dict[@"groupIds"] = arr;
  }
  [_impl openHelpCenterWithOptions:dict resolve:resolve reject:reject];
}

- (void)openTicket:(NSString *)ticketId
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  [_impl openTicketWithTicketId:ticketId resolve:resolve reject:reject];
}

- (void)openNewTicket:(JS::NativeZendeskUnified::OpenNewTicketOptions &)options
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  NSMutableDictionary *dict = [NSMutableDictionary new];
  if (options.subject()) dict[@"subject"] = options.subject();
  if (options.tags().has_value()) {
    auto tags = options.tags().value();
    NSMutableArray *arr = [NSMutableArray new];
    for (NSString *s : tags) [arr addObject:s];
    dict[@"tags"] = arr;
  }
  [_impl openNewTicketWithOptions:dict resolve:resolve reject:reject];
}

- (void)listTickets:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  [_impl listTicketsWithResolve:resolve reject:reject];
}

- (void)openArticle:(NSString *)articleId
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  [_impl openArticleWithArticleId:articleId resolve:resolve reject:reject];
}

- (void)setHelpCenterLocaleOverride:(NSString *)locale
                            resolve:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject {
  [_impl setHelpCenterLocaleOverrideWithLocale:locale resolve:resolve reject:reject];
}

- (void)changeTheme:(NSString *)color
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  [_impl changeThemeWithColor:color resolve:resolve reject:reject];
}

- (void)initializeChat:(NSString *)accountKey
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  [_impl initializeChatWithAccountKey:accountKey resolve:resolve reject:reject];
}

- (void)startChat:(JS::NativeZendeskUnified::StartChatOptions &)options
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  NSMutableDictionary *dict = [NSMutableDictionary new];
  if (options.botName()) dict[@"botName"] = options.botName();
  if (options.multilineResponseOptionsEnabled().has_value()) dict[@"multilineResponseOptionsEnabled"] = @(options.multilineResponseOptionsEnabled().value());
  if (options.agentAvailabilityEnabled().has_value()) dict[@"agentAvailabilityEnabled"] = @(options.agentAvailabilityEnabled().value());
  if (options.transcriptEnabled().has_value()) dict[@"transcriptEnabled"] = @(options.transcriptEnabled().value());
  if (options.offlineFormsEnabled().has_value()) dict[@"offlineFormsEnabled"] = @(options.offlineFormsEnabled().value());
  if (options.preChatFormEnabled().has_value()) dict[@"preChatFormEnabled"] = @(options.preChatFormEnabled().value());
  if (options.preChatFormFieldsStatus().has_value()) {
    auto f = options.preChatFormFieldsStatus().value();
    NSMutableDictionary *fields = [NSMutableDictionary new];
    if (f.nameFieldStatus()) fields[@"nameFieldStatus"] = f.nameFieldStatus();
    if (f.emailFieldStatus()) fields[@"emailFieldStatus"] = f.emailFieldStatus();
    if (f.phoneFieldStatus()) fields[@"phoneFieldStatus"] = f.phoneFieldStatus();
    if (f.departmentFieldStatus()) fields[@"departmentFieldStatus"] = f.departmentFieldStatus();
    dict[@"preChatFormFieldsStatus"] = fields;
  }
  [_impl startChatWithOptions:dict resolve:resolve reject:reject];
}

- (void)startAnswerBot:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  [_impl startAnswerBotWithResolve:resolve reject:reject];
}

@end
