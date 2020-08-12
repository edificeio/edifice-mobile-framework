export const getSubjectName = (subjectId, subjectsList) => {
  const result = subjectsList.find(subject => subject.subjectId === subjectId);
  if (typeof result === "undefined") return "";
  return result.subjectLabel;
};

export const getTeacherName = (teacherId, teachersList) => {
  const result = teachersList.find(personnel => personnel.id === teacherId);
  if (typeof result === "undefined") return "";
  return `${result.lastName} ${result.firstName}`;
};

export const  isHomeworkDone = homework => homework.progress !== null && homework.progress.state_label === "done";

export const homeworkDetailsAdapter = (homework, subjectsList) => {
  return {
    subject: getSubjectName(homework.subject_id, subjectsList),
    description: homework.description,
    due_date: homework.due_date,
    type: homework.type,
    created_date: homework.created_date,
  };
};

export const sessionDetailsAdapter = (session, subjectsList, teachersList) => {
  return {
    subject: getSubjectName(session.subject_id, subjectsList),
    date: session.date,
    teacher: getTeacherName(session.teacher_id, teachersList),
    description: session.description,
    title: session.title,
  };
};