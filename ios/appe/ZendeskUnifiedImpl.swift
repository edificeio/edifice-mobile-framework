import SupportSDK
import ZendeskCoreSDK
import AnswerBotProvidersSDK
import SDKConfigurations
import CommonUISDK
import AnswerBotSDK
import ChatSDK
import ChatProvidersSDK
import MessagingSDK

@objc(ZendeskUnifiedImpl)
public class ZendeskUnifiedImpl: NSObject {

  @objc public func healthCheckWithResolve(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    resolve("Module compiling and working")
  }

  @objc public func initializeWithConfig(_ config: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    guard
      let appId = config["appId"] as? String,
      let clientId = config["clientId"] as? String,
      let zendeskUrl = config["zendeskUrl"] as? String
    else {
      reject("initialize_error", "appId, clientId and zendeskUrl are required", nil)
      return
    }
    Zendesk.initialize(appId: appId, clientId: clientId, zendeskUrl: zendeskUrl)
    Support.initialize(withZendesk: Zendesk.instance)
    AnswerBot.initialize(withZendesk: Zendesk.instance, support: Support.instance!)
    if let accountKey = config["accountKey"] as? String {
      Chat.initialize(accountKey: accountKey)
    }
    #if DEBUG
    CoreLogger.enabled = true
    CoreLogger.logLevel = .verbose
    #endif
    resolve(true)
  }

  @objc public func setAnonymousIdentityWithOptions(_ options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let email = options["email"] as? String
    let name  = options["name"]  as? String
    let identity = Identity.createAnonymous(name: name, email: email)
    Zendesk.instance?.setIdentity(identity)
    resolve(true)
  }

  @objc public func setIdentityWithJwt(_ jwt: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let identity = Identity.createJwt(token: jwt)
    Zendesk.instance?.setIdentity(identity)
    resolve(true)
  }

  @objc public func openHelpCenterWithOptions(_ options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let labels           = options["labels"]             as? [String]
    let groupType        = options["groupType"]          as? String
    let groupIds         = options["groupIds"]           as? [NSNumber]
    let showContactOptions = options["showContactOptions"] as? Bool
    DispatchQueue.main.async {
      let articleCfg    = ArticleUiConfiguration()
      let helpCenterCfg = HelpCenterUiConfiguration()
      if let labels    = labels    { helpCenterCfg.labels  = labels }
      if let groupIds  = groupIds  { helpCenterCfg.groupIds = groupIds }
      if let groupType = groupType {
        helpCenterCfg.groupType = groupType == "category" ? .category : .section
      }
      if let show = showContactOptions {
        articleCfg.showContactOptions                       = show
        helpCenterCfg.showContactOptions                    = show
        helpCenterCfg.showContactOptionsOnEmptySearch       = show
      }
      let vc = HelpCenterUi.buildHelpCenterOverviewUi(withConfigs: [articleCfg, helpCenterCfg])
      self.present(vc)
      resolve(nil)
    }
  }

  @objc public func openTicketWithTicketId(_ ticketId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      let vc = RequestUi.buildRequestUi(requestId: ticketId)
      self.present(vc)
      resolve(nil)
    }
  }

  @objc public func openNewTicketWithOptions(_ options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let subject = options["subject"] as? String
    let tags    = options["tags"]    as? [String]
    DispatchQueue.main.async {
      let cfg = RequestUiConfiguration()
      if let subject = subject { cfg.subject = subject }
      if let tags    = tags    { cfg.tags    = tags }
      let vc = RequestUi.buildRequestUi(with: [cfg])
      self.present(vc)
      resolve(nil)
    }
  }

  @objc public func listTicketsWithResolve(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      let cfg = RequestListUIConfiguration()
      cfg.allowRequestCreation = true
      let vc = RequestUi.buildRequestList(with: [cfg])
      self.present(vc)
      resolve(nil)
    }
  }

  @objc public func openArticleWithArticleId(_ articleId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      let vc = HelpCenterUi.buildHelpCenterArticleUi(withArticleId: articleId, andConfigs: [])
      self.present(vc)
      resolve(nil)
    }
  }

  @objc public func setHelpCenterLocaleOverrideWithLocale(_ locale: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    Support.instance?.helpCenterLocaleOverride = locale
    resolve(nil)
  }

  @objc public func changeThemeWithColor(_ color: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    CommonTheme.currentTheme.primaryColor = uiColor(fromHex: color)
    resolve(nil)
  }

  @objc public func initializeChatWithAccountKey(_ accountKey: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    Chat.initialize(accountKey: accountKey)
    resolve(nil)
  }

  @objc public func startChatWithOptions(_ options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let botName = options["botName"] as? String
    let multiline = options["multilineResponseOptionsEnabled"] as? Bool
    let agentAvail = options["agentAvailabilityEnabled"] as? Bool
    let transcript = options["transcriptEnabled"] as? Bool
    let offline = options["offlineFormsEnabled"] as? Bool
    let preChatForm = options["preChatFormEnabled"] as? Bool
    let formFields = options["preChatFormFieldsStatus"] as? [String: String]
    DispatchQueue.main.async {
      do {
        let chatEngine    = try ChatEngine.engine()
        let chatCfg       = ChatConfiguration()
        let formCfg       = ChatFormConfiguration()
        let messagingCfg  = MessagingConfiguration()
        if let v = botName     { messagingCfg.name = v }
        if let v = multiline   { messagingCfg.isMultilineResponseOptionsEnabled = v }
        if let v = agentAvail  { chatCfg.isAgentAvailabilityEnabled = v }
        if let v = transcript  { chatCfg.isChatTranscriptPromptEnabled = v }
        if let v = offline     { chatCfg.isOfflineFormEnabled = v }
        if let v = preChatForm { chatCfg.isPreChatFormEnabled = v }
        if let f = formFields {
          formCfg.name        = self.formFieldStatus(f["nameFieldStatus"])
          formCfg.email       = self.formFieldStatus(f["emailFieldStatus"])
          formCfg.phoneNumber = self.formFieldStatus(f["phoneFieldStatus"])
          formCfg.department  = self.formFieldStatus(f["departmentFieldStatus"])
        }
        chatCfg.preChatFormConfiguration = formCfg
        let vc = try Messaging.instance.buildUI(engines: [chatEngine], configs: [chatCfg, messagingCfg])
        self.present(vc)
        resolve(nil)
      } catch {
        reject("start_chat_error", "Error initializing ChatEngine", error)
      }
    }
  }

  @objc public func startAnswerBotWithResolve(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      do {
        let engine = try AnswerBotEngine.engine()
        let vc     = try Messaging.instance.buildUI(engines: [engine], configs: [MessagingConfiguration()])
        self.present(vc)
        resolve(nil)
      } catch {
        reject("answer_bot_error", "Error initializing AnswerBotEngine", error)
      }
    }
  }

  private func present(_ viewController: UIViewController) {
    let nav = UINavigationController(rootViewController: viewController)
    applyNavBarAppearance()
    let root = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap { $0.windows }
      .first { $0.isKeyWindow }?
      .rootViewController
    root?.present(nav, animated: true)
  }

  private func applyNavBarAppearance() {
    UINavigationBar.appearance().tintColor = .white
    let a = UINavigationBarAppearance()
    a.backgroundColor          = CommonTheme.currentTheme.primaryColor
    a.titleTextAttributes      = [.foregroundColor: UIColor.white]
    a.largeTitleTextAttributes = [.foregroundColor: UIColor.white]
    UINavigationBar.appearance().standardAppearance   = a
    UINavigationBar.appearance().compactAppearance    = a
    UINavigationBar.appearance().scrollEdgeAppearance = a
    if #available(iOS 15.0, *) {
      UINavigationBar.appearance().compactScrollEdgeAppearance = a
    }
  }

  private func uiColor(fromHex hex: String) -> UIColor {
    let s = hex.trimmingCharacters(in: .whitespacesAndNewlines).replacingOccurrences(of: "#", with: "")
    var rgb: UInt64 = 0
    Scanner(string: s).scanHexInt64(&rgb)
    return UIColor(
      red:   CGFloat((rgb & 0xFF0000) >> 16) / 255,
      green: CGFloat((rgb & 0x00FF00) >>  8) / 255,
      blue:  CGFloat( rgb & 0x0000FF)         / 255,
      alpha: 1
    )
  }

  private func formFieldStatus(_ status: String?) -> FormFieldStatus {
    switch status {
    case "required": return .required
    case "optional": return .optional
    default:         return .hidden
    }
  }
}
