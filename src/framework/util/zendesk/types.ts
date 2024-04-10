export interface ZendeskConfig {
  /**
   * The Zendesk app ID.
   */
  appId?: string;
  /**
   * The Zendesk client ID.
   */
  clientId?: string;
  /**
   * The Zendesk URL.
   */
  zendeskUrl?: string;
  /**
   * The Zendesk account key. This is only required if you want to use the Chat SDK.
   */
  accountKey?: string;
}

export interface SetAnonymousIdentityOptions {
  /**
   * The email of the user.
   */
  email?: string;
  /**
   * The name of the user.
   */
  name?: string;
}

export interface OpenHelpCenterOptions {
  /**
   * The labels to filter by.
   */
  labels?: string[];
  /**
   * The type of group to filter by.
   */
  groupType?: 'category' | 'section';
  /**
   * The IDs of the categories or sections to filter by.
   */
  groupIds?: number[];
  /**
   * Whether to show the contact options.
   */
  showContactOptions?: boolean;
}

export interface OpenNewTicketOptions {
  /**
   * The subject of the ticket.
   */
  subject?: string;
  /**
   * The tags associated with the ticket.
   */
  tags?: string[];
  /**
   * The custom fields to set on the ticket.
   * The key is the ID of the custom field, and the value is the value to set.
   */
  customFields?: Record<number, string>;
}

export type PreChatFormFieldStatus = 'required' | 'optional' | 'hidden';

export interface PreChatFormFieldsStatus {
  nameFieldStatus?: PreChatFormFieldStatus;
  emailFieldStatus?: PreChatFormFieldStatus;
  phoneFieldStatus?: PreChatFormFieldStatus;
  departmentFieldStatus?: PreChatFormFieldStatus;
}

export interface StartChatOptions {
  /**
   * Agent name used for messages from bots.
   * If not specified, the default answer bot name will be used.
   */
  botName?: string;
  /**
   * There might be situations where the number of quick reply options cause the user to scroll horizontally through the options (Selecting a department in chat).
   * Enabling `multilineResponseOptionsEnabled` causes the options to be laid out in a Flexbox-style layout instead.
   */
  multilineResponseOptionsEnabled?: boolean;
  /**
   * If true, and no agents are available to serve the visitor,
   * they will be presented with a message letting them know that no agents are available. If it's disabled, visitors will remain in a queue waiting for an agent.
   * Defaults to `true`. Only checks the availability of the account, not specific departments. If availability information is needed on the department level.
   */
  agentAvailabilityEnabled?: boolean;
  /**
   * If true, visitors will be prompted at the end of the chat if they wish to receive a chat transcript or not. Defaults to `true`.
   */
  transcriptEnabled?: boolean;
  /**
   * If this flag is enabled (as well as agentAvailabilityEnabled) then visitors will be presented with a form allowing them to leave a message if no agents are available. This will create a support ticket. Defaults to `true`.
   */
  offlineFormsEnabled?: boolean;
  /**
   * If true, visitors are prompted for information in a conversational manner prior to starting the chat. Defaults to `true`.
   */
  preChatFormEnabled?: boolean;
  /**
   * These flags allow you to configure how a pre-chat form will appear to your visitors.
   */
  preChatFormFieldsStatus?: PreChatFormFieldsStatus;

  // chatMenuItems?: string[]; // @TODO: out of scope unless requested
}
