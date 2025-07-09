import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { byteSize, openFile } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './file.reducer';

export const FileDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const fileEntity = useAppSelector(state => state.file.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="fileDetailsHeading">File</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{fileEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{fileEntity.name}</dd>
          <dt>
            <span id="content">Content</span>
          </dt>
          <dd>
            {fileEntity.content ? (
              <div>
                {fileEntity.contentContentType ? (
                  <a onClick={openFile(fileEntity.contentContentType, fileEntity.content)}>Open&nbsp;</a>
                ) : null}
                <span>
                  {fileEntity.contentContentType}, {byteSize(fileEntity.content)}
                </span>
              </div>
            ) : null}
          </dd>
          <dt>Proposal</dt>
          <dd>{fileEntity.proposal ? fileEntity.proposal.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/file" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/file/${fileEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default FileDetail;
