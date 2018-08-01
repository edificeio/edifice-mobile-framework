/**
 * DiaryDayTasks
 *
 * Display the task list of a day (with day number and name).
 * Props:
 *     data - information of the day (number and name) and list of the tasks.
 *     onSelect - Function that will be called on touch on a card.
 */

// Libraries
import style from "glamorous-native";
import moize from "moize";
import * as React from "react";

import moment from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
moment.locale("fr");

// Components
const { View } = style;
import DiaryCard from "./DiaryCard";
import DiaryDayCheckpoint from "./DiaryDayCheckpoint";

// Type definitions
import { IDiaryDay } from "../reducers/tasks";

// Misc
import today from "../../utils/today";

interface IDiaryDayTasksProps {
  data: IDiaryDay;
  onSelect?: (itemId: string, date: moment.Moment) => void;
}

const MoizedDiaryCard = moize.react(DiaryCard); // TODO : moize doesn't seem to work in this case...

// tslint:disable-next-line:max-classes-per-file
export default class DiaryDayTasks extends React.Component<
  IDiaryDayTasksProps,
  {}
> {
  constructor(props: IDiaryDayTasksProps) {
    super(props);
  }

  public render() {
    const { data, onSelect } = this.props;
    const tasksAsArray = Object.values(data.tasks);
    return (
      <View>
        <DiaryDayCheckpoint
          nb={data.date.date()}
          text={data.date.format("dddd")}
          active={data.date.isSame(today(), "day")}
        />
        {tasksAsArray.map(item => (
          <MoizedDiaryCard
            title={item.title}
            content={item.content}
            key={item.id}
            onPress={() => onSelect(item.id, this.props.data.date)}
          />
        ))}
      </View>
    );
  }
}
