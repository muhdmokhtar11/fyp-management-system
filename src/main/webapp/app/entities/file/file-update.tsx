import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { ValidatedBlobField, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities as getProposals } from 'app/entities/proposal/proposal.reducer';
import { createEntity, getEntity, reset, updateEntity } from './file.reducer';
import { FileStatus } from 'app/shared/model/file.model';

export const FileUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const proposals = useAppSelector(state => state.proposal.entities);
  const fileEntity = useAppSelector(state => state.file.entity);
  const loading = useAppSelector(state => state.file.loading);
  const updating = useAppSelector(state => state.file.updating);
  const updateSuccess = useAppSelector(state => state.file.updateSuccess);

  const handleClose = () => {
    navigate('/file');
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

    dispatch(getProposals({}));
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

    const entity = {
      ...fileEntity,
      ...values,
      proposal: proposals.find(it => it.id.toString() === values.proposal?.toString()),
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
          status: FileStatus.DRAFT,
        }
      : {
          ...fileEntity,
          proposal: fileEntity?.proposal?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="fypManagementSystemApp.file.home.createOrEditLabel" data-cy="FileCreateUpdateHeading">
            Create or edit a File
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="file-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Name"
                id="file-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedBlobField
                label="Content"
                id="file-content"
                name="content"
                data-cy="content"
                openActionLabel="Open"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField id="file-status" name="status" data-cy="status" label="Status" type="select">
                {Object.values(FileStatus).map(status => (
                  <option value={status} key={status}>
                    {status}
                  </option>
                ))}
              </ValidatedField>
              <ValidatedField id="file-proposal" name="proposal" data-cy="proposal" label="Proposal" type="select">
                <option value="" key="0" />
                {proposals
                  ? proposals.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/file" replace color="info">
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

export default FileUpdate;
