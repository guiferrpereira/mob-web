import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose, setDisplayName, getContext } from "recompose";
import { reduxForm } from "redux-form";
import { connect } from "react-redux";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

import { workshop } from "fragments";
import { waitForData } from "enhancers";

//
// components
import WorkshopForm, { validate } from "components/admin/Workshops.Form";
import Workshop from "components/Workshop";
import { omit } from "lodash";

export class AdminEditWorkshop extends Component {

  state = {
    openModal: null,
  }

  //----------------------------------------------------------------------------
  // Lifecycle
  //----------------------------------------------------------------------------
  componentWillMount() {
    const { data: { workshop }, initialize } = this.props;

    initialize(omit(workshop, "__typename", "id", "users", "attendances"));
  }

  //----------------------------------------------------------------------------
  // Event Handlers
  //----------------------------------------------------------------------------
  updateWorkshop = (workshop) => {
    const { updateWorkshop, router } = this.props;

    return updateWorkshop({ variables: { slug: workshop.slug, workshop } })
    .then(response => {
      const { slug } = response.data.updateWorkshop;

      if (slug !== this.props.data.workshop.slug)
        router.push(`/admin/workshops/${slug}`);

      return null;
    });
  }

  deleteWorkshop = () => {
    const { deleteWorkshop, router, data: { workshop: { slug } } } = this.props;

    return deleteWorkshop({ variables: { slug } })
    .then(() => router.push("/admin/workshops"));
  }

  openModal = (id) => {
    this.setState({ openModal: id });
  }

  closeModal = () => {
    this.setState({ openModal: null });
  }

  //----------------------------------------------------------------------------
  // Event Handlers
  //----------------------------------------------------------------------------
  render() {
    const { data: { workshop }, formValues, handleSubmit, submitting, submitSucceeded } = this.props;

    return (
      <div className="admin--container admin--workshops--edit">
        <div>
          <h3>
            Edit workshop
          </h3>

          <WorkshopForm
            {...{ handleSubmit, submitting, submitSucceeded }}
            buttonLabel="Update Workshop"
            form="editWorkshop"
            save={this.updateWorkshop}
            remove={this.deleteWorkshop}
          />
        </div>

        <div className="preview">
          <h1>Preview</h1>

          <Workshop
            workshop={{ ...workshop, ...formValues }}
            showSummary
            showDescription
            showSpeaker
            debug
          />
        </div>
      </div>
    );
  }
}

export default compose(
  setDisplayName("AdminEditWorkshop"),

  getContext({
    router: PropTypes.object.isRequired,
  }),

  reduxForm({
    form: "editWorkshop",
    validate,
  }),

  graphql(
    gql`query workshop($slug: String!) {
      workshop(slug: $slug) {
        ...workshop
        users { id name email }
      }
    } ${workshop}`,
    {
      skip: props => !props.params.slug,
      options: props => ({
        variables: { slug: props.params.slug },
      }),
    }
  ),

  waitForData,

  graphql(
    gql`mutation updateWorkshop($slug: String!, $workshop: WorkshopInput!) {
      updateWorkshop(slug: $slug, workshop: $workshop) { ...workshop }
    } ${workshop}`,
    { name: "updateWorkshop" },
  ),

  graphql(
    gql`mutation deleteWorkshop($slug: String!) {
      deleteWorkshop(slug: $slug) { slug }
    }`,
    { name: "deleteWorkshop" },
  ),

  connect(({ form }) => ({
    formValues: form.editWorkshop.values || {},
  })),
)(AdminEditWorkshop);
