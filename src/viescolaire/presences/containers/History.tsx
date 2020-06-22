import * as React from "react";
import { connect } from "react-redux";
import { PageContainer } from "../../../ui/ContainerContent";
import History from "../components/History";

class AbsenceHistory extends React.PureComponent<{data: any}> {
 
  public render() {
    return (
      <PageContainer>
        <History data={this.props.data}/>
      </PageContainer>
    );
  }
}

const mapStateToProps = () => {
  return {
    data: {
      absences: [{date: '17/01/19', time:'8:30 - 9:25'}, {date: '19/09/18', time:'Journée entière'}],
      retards: [
        {date: '04/10/18 - 10:35 - 11:25', time:'10mn'},
        {date: '09/01/19 - 8:30 - 9:25', time:'5mn'},
        {date: '09/01/19 - 8:30 - 9:25', time:'5mn'},
        {date: '10/01/19 - 10:35 - 11:25', time:'5mn'},
        {date: '21/01/19 - 8:30 - 9:25', time:'5mn'},
      ],
      empty: [],
    },
  };
}

const mapDispatchToProps = () => {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(AbsenceHistory);
