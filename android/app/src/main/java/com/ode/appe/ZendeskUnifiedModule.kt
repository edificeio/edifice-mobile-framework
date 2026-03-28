package com.ode.appe

import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.zendesk.logger.Logger
import zendesk.answerbot.AnswerBot
import zendesk.answerbot.AnswerBotEngine
import zendesk.chat.Chat
import zendesk.chat.ChatConfiguration
import zendesk.chat.ChatEngine
import zendesk.chat.PreChatFormFieldStatus
import zendesk.classic.messaging.MessagingActivity
import zendesk.core.AnonymousIdentity
import zendesk.core.JwtIdentity
import zendesk.core.Zendesk
import zendesk.support.CustomField
import zendesk.support.Support
import zendesk.support.guide.HelpCenterActivity
import zendesk.support.guide.ViewArticleActivity
import zendesk.support.request.RequestActivity
import zendesk.support.requestlist.RequestListActivity
import java.util.Locale

@ReactModule(name = ZendeskUnifiedModule.NAME)
class ZendeskUnifiedModule(reactContext: ReactApplicationContext) :
  NativeZendeskUnifiedSpec(reactContext) {

  private val context = reactApplicationContext

  override fun getName() = NAME

  companion object {
    const val NAME = "ZendeskUnified"
  }

  @ReactMethod
  override fun healthCheck(promise: Promise) {
    promise.resolve("Module compiling and working")
  }

  @ReactMethod
  override fun initialize(config: ReadableMap, promise: Promise) {
    val appId = config.getString("appId") ?: run { promise.reject("initialize_error", "appId required"); return }
    val clientId = config.getString("clientId") ?: run { promise.reject("initialize_error", "clientId required"); return }
    val zendeskUrl = config.getString("zendeskUrl") ?: run { promise.reject("initialize_error", "zendeskUrl required"); return }
    val accountKey = config.getString("accountKey")
    Zendesk.INSTANCE.init(context, zendeskUrl, appId, clientId)
    Support.INSTANCE.init(Zendesk.INSTANCE)
    AnswerBot.INSTANCE.init(Zendesk.INSTANCE, Support.INSTANCE)
    if (accountKey != null) Chat.INSTANCE.init(context, accountKey)
    if (BuildConfig.DEBUG) Logger.setLoggable(true)
    promise.resolve(true)
  }

  @ReactMethod
  override fun setAnonymousIdentity(options: ReadableMap, promise: Promise) {
    try {
      val builder = AnonymousIdentity.Builder()
      options.getString("email")?.let { builder.withEmailIdentifier(it) }
      options.getString("name")?.let  { builder.withNameIdentifier(it) }
      Zendesk.INSTANCE.setIdentity(builder.build())
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("set_anonymous_identity_error", e)
    }
  }

  @ReactMethod
  override fun setIdentity(jwt: String, promise: Promise) {
    try {
      Zendesk.INSTANCE.setIdentity(JwtIdentity(jwt))
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("set_identity_error", e)
    }
  }

  @ReactMethod
  override fun openHelpCenter(options: ReadableMap, promise: Promise) {
    @Suppress("UNCHECKED_CAST")
    val labels = options.getArray("labels")?.toArrayList()?.filterIsInstance<String>() ?: emptyList()
    val groupType = options.getString("groupType")
    @Suppress("UNCHECKED_CAST")
    val groupIds = (options.getArray("groupIds")?.toArrayList()?.filterIsInstance<Double>()) ?.map { it.toLong() } ?: emptyList()
    val showContact = runCatching { options.getBoolean("showContactOptions") }.getOrNull()
    val helpCenter  = HelpCenterActivity.builder()
    val articleView = ViewArticleActivity.builder()
    if (labels.isNotEmpty()) helpCenter.withLabelNames(labels)
    if (groupType != null && groupIds.isNotEmpty()) {
      if (groupType == "category")
          helpCenter.withArticlesForCategoryIds(groupIds)
      else
          helpCenter.withArticlesForSectionIds(groupIds)
    }
    if (showContact != null) {
      articleView.withContactUsButtonVisible(showContact)
      helpCenter.withContactUsButtonVisible(showContact)
      helpCenter.withShowConversationsMenuButton(showContact)
    }
    helpCenter.show(context.currentActivity!!, articleView.config(), helpCenter.config())
    promise.resolve(null)
  }

  @ReactMethod
  override fun openTicket(ticketId: String, promise: Promise) {
    context.startActivity(
      RequestActivity.builder().withRequestId(ticketId).intent(context)
        .apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK }
    )
    promise.resolve(null)
  }

  @ReactMethod
  override fun openNewTicket(options: ReadableMap, promise: Promise) {
    val subject = options.getString("subject")
    val tags = mutableListOf<String>().also { list ->
      options.getArray("tags")?.toArrayList()?.forEach { if (it is String) list.add(it) }
    }
    val builder = RequestActivity.builder()
    if (subject != null) builder.withRequestSubject(subject)
    if (tags.isNotEmpty()) builder.withTags(tags)
    context.startActivity(builder.intent(context).apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK })
    promise.resolve(null)
  }

  @ReactMethod
  override fun listTickets(promise: Promise) {
    context.startActivity(
      RequestListActivity.builder().intent(context)
        .apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK }
    )
    promise.resolve(null)
  }

  @ReactMethod
  override fun openArticle(articleId: String, promise: Promise) {
    context.startActivity(
      ViewArticleActivity.builder(articleId.toLong()).intent(context)
        .apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK }
    )
    promise.resolve(null)
  }

  @ReactMethod
  override fun setHelpCenterLocaleOverride(locale: String, promise: Promise) {
    Support.INSTANCE.setHelpCenterLocaleOverride(Locale(locale))
    promise.resolve(null)
  }

  @ReactMethod
  override fun changeTheme(color: String, promise: Promise) {
    Log.d("ZendeskUnifiedLogger", "changeTheme is not supported on Android.")
    promise.resolve(null)
  }

  @ReactMethod
  override fun initializeChat(accountKey: String, promise: Promise) {
    Chat.INSTANCE.init(context, accountKey)
    promise.resolve(null)
  }

  @ReactMethod
  override fun startChat(options: ReadableMap, promise: Promise) {
    val botName = options.getString("botName")
    val multilineResponseOptionsEnabled = runCatching { options.getBoolean("multilineResponseOptionsEnabled") }.getOrNull()
    val agentAvailabilityEnabled = runCatching { options.getBoolean("agentAvailabilityEnabled") }.getOrNull()
    val transcriptEnabled = runCatching { options.getBoolean("transcriptEnabled") }.getOrNull()
    val offlineFormsEnabled = runCatching { options.getBoolean("offlineFormsEnabled") }.getOrNull()
    val preChatFormEnabled = runCatching { options.getBoolean("preChatFormEnabled") }.getOrNull()
    val preChatFormFieldsStatus = mutableMapOf<String, String>().also { map ->
      options.getMap("preChatFormFieldsStatus")?.toHashMap()?.forEach { (k, v) ->
        if (v is String) map[k] = v
      }
    }
    val messaging = MessagingActivity.builder()
    val chatEngine = ChatEngine.engine()
    val chatConfig = ChatConfiguration.builder()
    if (botName != null) messaging.withBotLabelString(botName)
    if (multilineResponseOptionsEnabled != null) messaging.withMultilineResponseOptionsEnabled(multilineResponseOptionsEnabled)
    if (agentAvailabilityEnabled != null) chatConfig.withAgentAvailabilityEnabled(agentAvailabilityEnabled)
    if (transcriptEnabled != null) chatConfig.withTranscriptEnabled(transcriptEnabled)
    if (offlineFormsEnabled != null) chatConfig.withOfflineFormEnabled(offlineFormsEnabled)
    if (preChatFormEnabled != null) chatConfig.withPreChatFormEnabled(preChatFormEnabled)
    preChatFormFieldsStatus["nameFieldStatus"]?.let { chatConfig.withNameFieldStatus(preChatFormFieldStatus(it)) }
    preChatFormFieldsStatus["emailFieldStatus"]?.let { chatConfig.withEmailFieldStatus(preChatFormFieldStatus(it)) }
    preChatFormFieldsStatus["phoneFieldStatus"]?.let { chatConfig.withPhoneFieldStatus(preChatFormFieldStatus(it)) }
    preChatFormFieldsStatus["departmentFieldStatus"]?.let { chatConfig.withDepartmentFieldStatus(preChatFormFieldStatus(it)) }
    context.startActivity(
      messaging.withEngines(chatEngine).intent(context, chatConfig.build())
        .apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK }
    )
    promise.resolve(null)
  }

  @ReactMethod
  override fun startAnswerBot(promise: Promise) {
    context.startActivity(
      MessagingActivity.builder().withEngines(AnswerBotEngine.engine()).intent(context)
        .apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK }
    )
    promise.resolve(null)
  }

  private fun preChatFormFieldStatus(status: String): PreChatFormFieldStatus = when (status) {
    "required" -> PreChatFormFieldStatus.REQUIRED
    "optional" -> PreChatFormFieldStatus.OPTIONAL
    else       -> PreChatFormFieldStatus.HIDDEN
  }
}
