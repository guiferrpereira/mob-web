import React, { Component } from "react";
import { compose, setDisplayName } from "recompose";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

import { waitForData, withCompetitionSelector } from "enhancers";

export const DasboardCard = ({
  title,
  icon,
  items, // [ [left, right], [left, right], ... ]
}) => (
  <div className="admin--dashboard--card">
    <h2 className="header">
      {title}
      <div className={`icon icon--${icon}`} />
    </h2>
    <ul>
      {items.map(([left, right], i) => (
        <li key={i}>
          <span>{left}</span>
          <span>{right}</span>
        </li>
      ))}
    </ul>
  </div>
);

export class Dashboard extends Component {

  render() {
    const {
      adminStats: { workshops },
      competition: { attendances, teams, suffrages },
    } = this.props.data;

    return (
      <div className="admin--dashboard">
        <DasboardCard
          title={`${attendances.length} Users`}
          icon="person"
          items={[
            ["Checked in", attendances.filter(a => a.checkedIn).length],
            ["With team", attendances.filter(a => a.user.currentTeam).length],
            ["Participants", attendances.filter(a => a.user.role === "participant").length],
          ]}
        />

        <DasboardCard
          title={`${teams.length} Teams`}
          icon="group"
          items={[
            ["Applied"  , teams.filter(t => t.applied).length],
            ["Accepted" , teams.filter(t => t.accepted).length],
            ["Eligible" , teams.filter(t => t.eligible).length],
          ]}
        />

        <DasboardCard
          title={`${suffrages.length} Categories`}
          icon="how-to-vote"
          items={suffrages.map(s => [`Teams up for ${s.name}`, s.teams.length])}
        />

        <DasboardCard
          title={`${workshops.length} Workshops`}
          icon="work"
          items={workshops.map(w => [w.name, `${w.participants} / ${w.participant_limit}`])}
        />
      </div>
    );
  }
}

export default compose(
  setDisplayName("Dashboard"),

  withCompetitionSelector,

  graphql(gql`query stats($competitionId: String!) {
    adminStats { workshops }

    competition(id: $competitionId) {
      id
      attendances { id checkedIn user { id role currentTeam { id } } }
      suffrages { id name teams { id } }
      teams { id applied accepted eligible }
    }
  }`,
  {
    options: ({ competitionId }) => ({ variables: { competitionId } }),
  }),

  waitForData,
)(Dashboard);
