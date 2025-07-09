import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, FormText, Row } from 'reactstrap';
import { ValidatedField, ValidatedForm, isNumber } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getUsers } from 'app/modules/administration/user-management/user-management.reducer';
import { ProposalStatus } from 'app/shared/model/enumerations/proposal-status.model';
import { createEntity, getEntity, reset, updateEntity } from './proposal.reducer';

export const ProposalUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const users = useAppSelector(state => state.userManagement.users);
  const proposalEntity = useAppSelector(state => state.proposal.entity);
  const loading = useAppSelector(state => state.proposal.loading);
  const updating = useAppSelector(state => state.proposal.updating);
  const updateSuccess = useAppSelector(state => state.proposal.updateSuccess);
  const proposalStatusValues = Object.keys(ProposalStatus);

  const handleClose = () => {
    navigate(`/proposal${location.search}`);
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

    dispatch(getUsers({}));
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    if (values.id !== undefined && typeof values.id !== 'number') {
      values.id = Number(values.id);
    }
    values.submissionDate = convertDateTimeToServer(values.submissionDate);
    if (values.plagiarismScore !== undefined && typeof values.plagiarismScore !== 'number') {
      values.plagiarismScore = Number(values.plagiarismScore);
    }

    const entity = {
      ...proposalEntity,
      ...values,
      student: users.find(it => it.id.toString() === values.student?.toString()),
      preferredSupervisor: users.find(it => it.id.toString() === values.preferredSupervisor?.toString()),
    };

    if (isNew) {
      dispatch(createEntity(entity));
    } else {
      dispatch(updateEntity(entity));
    }
  };

  const defaultValues = () =>
    isNew
      ? {
          submissionDate: displayDefaultDateTime(),
        }
      : {
          status: 'SUBMITTED',
          ...proposalEntity,
          submissionDate: convertDateTimeFromServer(proposalEntity.submissionDate),
          student: proposalEntity?.student?.id,
          preferredSupervisor: proposalEntity?.preferredSupervisor?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="fypManagementSystemApp.proposal.home.createOrEditLabel" data-cy="ProposalCreateUpdateHeading">
            Create or edit a Proposal
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="proposal-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Title"
                id="proposal-title"
                name="title"
                data-cy="title"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  minLength: { value: 5, message: 'This field is required to be at least 5 characters.' },
                  maxLength: { value: 200, message: 'This field cannot be longer than 200 characters.' },
                }}
              />
              <ValidatedField
                label="Proposal Abstract"
                id="proposal-proposalAbstract"
                name="proposalAbstract"
                data-cy="proposalAbstract"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  minLength: { value: 20, message: 'This field is required to be at least 20 characters.' },
                  maxLength: { value: 1000, message: 'This field cannot be longer than 1000 characters.' },
                }}
              />
              <ValidatedField
                label="Submission Date"
                id="proposal-submissionDate"
                name="submissionDate"
                data-cy="submissionDate"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Methodology"
                id="proposal-methodology"
                name="methodology"
                data-cy="methodology"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  minLength: { value: 20, message: 'This field is required to be at least 20 characters.' },
                  maxLength: { value: 1000, message: 'This field cannot be longer than 1000 characters.' },
                }}
              />
              <ValidatedField label="Status" id="proposal-status" name="status" data-cy="status" type="select">
                {proposalStatusValues.map(proposalStatus => (
                  <option value={proposalStatus} key={proposalStatus}>
                    {proposalStatus}
                  </option>
                ))}
              </ValidatedField>
              <ValidatedField
                label="Plagiarism Score"
                id="proposal-plagiarismScore"
                name="plagiarismScore"
                data-cy="plagiarismScore"
                type="text"
                validate={{
                  min: { value: 0, message: 'This field should be at least 0.' },
                  max: { value: 100, message: 'This field cannot be more than 100.' },
                  validate: v => isNumber(v) || 'This field should be a number.',
                }}
              />
              <ValidatedField id="proposal-student" name="student" data-cy="student" label="Student" type="select" required>
                <option value="" key="0" />
                {users
                  ? users.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.login}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <FormText>This field is required.</FormText>
              <ValidatedField
                id="proposal-preferredSupervisor"
                name="preferredSupervisor"
                data-cy="preferredSupervisor"
                label="Preferred Supervisor"
                type="select"
              >
                <option value="" key="0" />
                {users
                  ? users.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.login}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/proposal" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">Back</span>
              </Button>
              &nbsp;
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Save
              </Button>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProposalUpdate;
