export type BackendCall = {
  personnel_id: string;
  proof_id: string | null;
  course_id: string;
  owner: string;
  notified: boolean;
  subject_id: string;
  start_date: string;
  end_date: string;
  structure_id: string;
  counsellor_input: boolean;
  state_id: number;
  groups: {
    id: string;
    type: string;
  }[];
  students: {
    id: string;
    name: string;
    birth_day: string | null;
    group: string;
    group_name: string;
    events: BackendEvent[];
    last_course_absent: boolean;
    forgotten_notebook: boolean;
    day_history: {
      events: BackendEvent[];
      start: string;
      end: string;
      name: string;
    }[];
    exempted: boolean;
    exemptions: any[];
  }[];
  teachers: {
    id: string;
    displayName: string;
    functions: string;
  }[];
};

export type BackendCourse = {
  structureId: string;
  subjectId: string;
  classes: string[];
  exceptionnal: string;
  groups: string[];
  roomLabels: string[];
  events: any[];
  splitCourses: any;
  exempted: boolean | null;
  exemption: any;
  incident: any;
  punishments: any[];
  dayOfWeek: number;
  manual: boolean;
  locked: boolean | null;
  updated: string;
  lastUser: string;
  startDate: string;
  endDate: string;
  color: string;
  subjectName: string;
  teachers: {
    id: string;
    displayName: string;
  }[];
  registerId: number | null;
  registerStateId: number;
  notified: boolean;
  splitSlot: boolean;
  timestamp: number;
  subject: {
    id: string;
    externalId: string;
    code: string;
    name: string;
    rank: number;
  };
  isOpenedByPersonnel: boolean;
  allowRegister: boolean;
  recurrent: boolean | null;
  periodic: boolean | null;
  id: string;
};

export type BackendEvent = {
  id: number;
  owner: {
    id: string;
    displayName: string;
    info: string | null;
    firstName: string;
    lastName: string;
  };
  comment: string;
  type_id: number;
  end_date: string;
  followed: boolean;
  reason_id: number | null;
  massmailed: boolean;
  start_date: string;
  register_id: string;
  counsellor_input: boolean;
  counsellor_regularisation: boolean;
  type: string;
};

export type BackendEventReason = {
  id: number;
  structure_id: string;
  label: string;
  proving: boolean;
  comment: string;
  default: boolean;
  group: boolean;
  hidden: boolean;
  absence_compliance: boolean;
  created: string;
  reason_type_id: number;
  reason_alert_rules: string[];
  used: boolean;
};

export type BackendAbsences = {
  all: {
    id: number;
    start_at: string;
    end_at: string;
    structure_id: string;
    description: string;
    treated_at: string | null;
    validator_id: string | null;
    attachment_id: string | null;
    created_at: string;
    parent_id: string;
    metadata: string | null;
    student: {
      id: string;
      name: string;
      lastName: string;
      firstName: string;
      className: string;
      structure_id: string;
    };
  }[];
  page_count: number;
};

export type BackendHistoryEvent = {
  id: number;
  start_date: string;
  end_date: string;
  comment: string;
  counsellor_input: boolean;
  student_id: string;
  register_id: number;
  type_id: number;
  reason_id: number | null;
  owner: string;
  created: string;
  counsellor_regularisation: boolean;
  followed: boolean;
  massmailed: boolean;
  display_start_date: string;
  display_end_date: string;
  reason: {
    id: number;
    structure_id: string;
    label: string;
    proving: boolean;
    comment: string;
    default: boolean;
    group: boolean;
    hidden: boolean;
    absence_compliance: boolean;
    created: string;
    reason_type_id: number;
  } | null;
};

export type BackendHistoryEvents = {
  all: {
    DEPARTURE: BackendHistoryEvent[];
    NO_REASON: BackendHistoryEvent[];
    REGULARIZED: BackendHistoryEvent[];
    LATENESS: BackendHistoryEvent[];
    UNREGULARIZED: BackendHistoryEvent[];
  };
  totals: {
    DEPARTURE: number;
    NO_REASON: number;
    REGULARIZED: number;
    LATENESS: number;
    UNREGULARIZED: number;
  };
  recovery_method: 'DAY' | 'HALF_DAY' | 'HOUR' | null;
};

export type BackendForgottenNotebooks = {
  all: {
    id: number;
    student_id: string;
    structure_id: string;
    date: string;
  }[];
  totals: number;
};

export type BackendIncidents = {
  all: {
    INCIDENT: {
      id: number;
      owner: string;
      structure_id: string;
      date: string;
      selected_hour: boolean;
      description: string;
      created: string;
      processed: boolean;
      place_id: number;
      partner_id: number;
      type_id: number;
      seriousness_id: number;
      place: string;
      incident_type: string;
      student_id: string;
      protagonist_type: string;
      protagonist_type_id: number;
      protagonist: {
        id: number;
        structure_id: string;
        label: string;
        hidden: boolean;
        created: string;
        used: boolean;
      };
      type: {
        id: number;
        structure_id: string;
        label: string;
        hidden: boolean;
        created: string;
        used: boolean;
      };
    }[];
    PUNISHMENT: {
      _id: string;
      type_id: number;
      owner_id: string;
      description: string;
      student_id: string;
      structure_id: string;
      processed: boolean;
      incident_id: number | null;
      fields: {
        start_at: string;
        end_at: string;
      };
      id: string;
      created_at: string;
      updated_at: string | null;
      owner: {
        id: string;
        firstName: string;
        lastName: string;
        displayName: string;
      };
      student: {
        id: string;
        name: string;
        lastName: string;
        firstName: string;
        className: string;
        structure_id: string;
      };
      type: {
        id: number;
        structure_id: string;
        label: string;
        type: string;
        punishment_category_id: number;
        hidden: boolean;
        created: string;
      };
    }[];
  };
  totals: {
    INCIDENT: number;
    PUNISHMENT: number;
  };
};

export type BackendStudentEvents = {
  all: {
    DEPARTURE: BackendEvent[];
    LATENESS: BackendEvent[];
    NO_REASON: BackendEvent[];
    REGULARIZED: BackendEvent[];
    UNREGULARIZED: BackendEvent[];
  };
  totals: {
    DEPARTURE: number;
    LATENESS: number;
    NO_REASON: number;
    REGULARIZED: number;
    UNREGULARIZED: number;
  };
};

export type BackendStudentsEvents = {
  limit: number | null;
  offset: number | null;
  recovery_method: 'DAY' | 'HALF_DAY' | 'HOUR' | null;
  students_events: { [studentId: string]: BackendStudentEvents };
};

export type BackendUserChild = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  birth: string;
  structures: {
    id: string;
    name: string;
    classes: {
      name: string;
      id: string;
      structure: string;
    }[];
  }[];
};

export type BackendCourseList = BackendCourse[];
export type BackendEventReasonList = BackendEventReason[];
export type BackendUserChildren = BackendUserChild[];
