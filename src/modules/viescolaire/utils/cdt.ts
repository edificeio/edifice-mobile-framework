export const getTeacherName = (teacherId, teachersList) => {
  const result = teachersList.find(personnel => personnel.id === teacherId);
  if (typeof result === "undefined") return "";
  return `${result.lastName} ${result.firstName}`;
};

export const isHomeworkDone = homework => homework.progress !== null && homework.progress.state_label === "done";

export const homeworkDetailsAdapter = homework => {
  return {
    subject: homework.subject_id !== "exceptional" ? homework.subject.name : homework.exceptional_label,
    description: homework.description,
    due_date: homework.due_date,
    type: homework.type,
    created_date: homework.created_date,
  };
};

export const sessionDetailsAdapter = (session, teachersList) => {
  return {
    subject: session.subject_id !== "exceptional" ? session.subject.name : session.exceptional_label,
    date: session.date,
    teacher: getTeacherName(session.teacher_id, teachersList),
    description: session.description,
    title: session.title,
  };
};