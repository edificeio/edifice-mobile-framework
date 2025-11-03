export interface IBackendDistribution {
  id: number;
  form_id: number;
  sender_id: string;
  sender_name: string;
  responder_id: string;
  responder_name: string;
  status: string;
  date_sending: string;
  date_response?: string;
  active: boolean;
  structure?: string;
  original_id?: number;
}

export interface IBackendForm {
  id: number;
  title: string;
  description: string;
  picture: string;
  owner_id: string;
  owner_name: string;
  date_creation: string;
  date_modification: string;
  sent: boolean;
  collab: boolean;
  archived: boolean;
  date_opening: string;
  date_ending?: string;
  multiple: boolean;
  anonymous: boolean;
  reminded: boolean;
  response_notified: boolean;
  editable: boolean;
  rgpd: boolean;
  rgpd_goal: string;
  rgpd_lifetime: number;
  is_public: boolean;
  public_key?: number;
}

export interface IBackendQuestion {
  id: number;
  form_id: number;
  title: string;
  position: number | null;
  question_type: number;
  statement: string;
  mandatory: boolean;
  original_question_id: number;
  section_id: number;
  section_position: number | null;
  conditional: boolean;
  placeholder?: string;
  matrix_id?: number;
  matrix_position?: number;
  cursor_min_val?: number;
  cursor_max_val?: number;
  cursor_step?: number;
  cursor_min_label?: string;
  cursor_max_label?: string;
}

export interface IBackendQuestionChoice {
  id: number;
  question_id: number;
  value: string;
  type: string;
  position: number;
  next_form_element_id: number | null;
  is_custom: boolean;
  next_form_element_type: 'QUESTION' | 'SECTION' | null;
  is_next_form_element_default: boolean;
  image: string | null;
}

export interface IBackendQuestionResponse {
  id: number;
  question_id: number;
  answer: string;
  responder_id: string;
  choice_id?: number;
  distribution_id: number;
  original_id?: number;
  choice_position?: number;
  custom_answer: string;
}

export interface IBackendResponseFile {
  id: string;
  response_id: number;
  filename: string;
  type: string;
}

export interface IBackendSection {
  id: number;
  form_id: number;
  title: string;
  description: string;
  position: number;
  original_section_id?: number;
}

export type IBackendDistributionList = IBackendDistribution[];
export type IBackendFormList = IBackendForm[];
export type IBackendQuestionList = IBackendQuestion[];
export type IBackendQuestionChoiceList = IBackendQuestionChoice[];
export type IBackendQuestionResponseList = IBackendQuestionResponse[];
export type IBackendResponseFileList = IBackendResponseFile[];
export type IBackendSectionList = IBackendSection[];
