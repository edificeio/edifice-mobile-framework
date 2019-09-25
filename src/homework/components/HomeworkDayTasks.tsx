/**
 * HomeworkDayTasks
 *
 * Display the task list of a day (with day number and name).
 * Props:
 *     style
 *     data - information of the day (number and name) and list of the tasks.
 *     onSelect - Fires when the user touches a task.
 */

// Libraries
import style from "glamorous-native";
import * as React from "react";

import moment from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
moment.locale("fr");

// Components
const { View } = style;
import HomeworkCard from "./HomeworkCard";
import HomeworkDayCheckpoint from "./HomeworkDayCheckpoint";

// Type definitions
import { IHomeworkDay, IHomeworkTask } from "../reducers/tasks";

// Misc
import today from "../../utils/today";

interface IHomeworkDayTasksProps {
  style?: any;
  data: IHomeworkDay;
  onSelect?: (item: IHomeworkTask, date: moment.Moment) => void;
}

// tslint:disable-next-line:max-classes-per-file
export class HomeworkDayTasks extends React.PureComponent<
  IHomeworkDayTasksProps,
  {}
> {
  constructor(props: IHomeworkDayTasksProps) {
    super(props);
  }

  public render() {
    const { data, onSelect, style } = this.props;
    const tasksAsArray = Object.values(data.tasks) as IHomeworkTask[];

    return (
      <View style={[style]}>
        <HomeworkDayCheckpoint
          nb={data.date.date()}
          text={data.date.format("dddd D MMMM")}
          active={data.date.isSame(today(), "day")}
        />
        {tasksAsArray.map(item => (
          <HomeworkCard
            title={item.title}
            content={item.content}
            key={item.id}
            onPress={() => onSelect!(item, this.props.data.date)}
          />
        ))}
      </View>
    );
  }
}

export default HomeworkDayTasks;
