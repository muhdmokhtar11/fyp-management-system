import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './proposal.reducer';

export const ProposalDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const proposalEntity = useAppSelector(state => state.proposal.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="proposalDetailsHeading">Proposal</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{proposalEntity.id}</dd>
          <dt>
            <span id="title">Title</span>
          </dt>
          <dd>{proposalEntity.title}</dd>
          <dt>
            <span id="proposalAbstract">Proposal Abstract</span>
          </dt>
          <dd>{proposalEntity.proposalAbstract}</dd>
          <dt>
            <span id="submissionDate">Submission Date</span>
          </dt>
          <dd>
            {proposalEntity.submissionDate ? (
              <TextFormat value={proposalEntity.submissionDate} type="date" format={APP_DATE_FORMAT} />
            ) : null}
          </dd>
          <dt>
            <span id="methodology">Methodology</span>
          </dt>
          <dd>{proposalEntity.methodology}</dd>
          <dt>
            <span id="status">Status</span>
          </dt>
          <dd>{proposalEntity.status}</dd>
          <dt>
            <span id="plagiarismScore">Plagiarism Score</span>
          </dt>
          <dd>{proposalEntity.plagiarismScore}</dd>
          <dt>Student</dt>
          <dd>{proposalEntity.student ? proposalEntity.student.login : ''}</dd>
          <dt>Preferred Supervisor</dt>
          <dd>{proposalEntity.preferredSupervisor ? proposalEntity.preferredSupervisor.login : ''}</dd>
        </dl>
        <Button tag={Link} to="/proposal" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/proposal/${proposalEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default ProposalDetail;
