import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Table, Badge, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { byteSize, getSortState, openFile } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortDown, faSortUp, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { ASC, DESC } from 'app/shared/util/pagination.constants';
import { overrideSortStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities, updateEntity } from './file.reducer';
import { FileStatus } from 'app/shared/model/file.model';

export const File = () => {
  const dispatch = useAppDispatch();

  const pageLocation = useLocation();
  const navigate = useNavigate();

  const [sortState, setSortState] = useState(overrideSortStateWithQueryParams(getSortState(pageLocation, 'id'), pageLocation.search));
  const [statusFilter, setStatusFilter] = useState<FileStatus | 'ALL'>('ALL');

  const fileList = useAppSelector(state => state.file.entities);
  const loading = useAppSelector(state => state.file.loading);

  const getAllEntities = () => {
    dispatch(
      getEntities({
        sort: `${sortState.sort},${sortState.order}`,
      }),
    );
  };

  const sortEntities = () => {
    getAllEntities();
    const endURL = `?sort=${sortState.sort},${sortState.order}`;
    if (pageLocation.search !== endURL) {
      navigate(`${pageLocation.pathname}${endURL}`);
    }
  };

  useEffect(() => {
    sortEntities();
  }, [sortState.order, sortState.sort]);

  const sort = p => () => {
    setSortState({
      ...sortState,
      order: sortState.order === ASC ? DESC : ASC,
      sort: p,
    });
  };

  const handleSyncList = () => {
    sortEntities();
  };

  const getSortIconByFieldName = (fieldName: string) => {
    const sortFieldName = sortState.sort;
    const order = sortState.order;
    if (sortFieldName !== fieldName) {
      return faSort;
    }
    return order === ASC ? faSortUp : faSortDown;
  };

  const getStatusBadgeColor = (status: FileStatus) => {
    switch (status) {
      case FileStatus.DRAFT:
        return 'secondary';
      case FileStatus.REVIEW:
        return 'warning';
      case FileStatus.APPROVED:
        return 'success';
      case FileStatus.REJECTED:
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const handleStatusChange = (fileId: number, newStatus: FileStatus) => {
    const fileToUpdate = fileList.find(file => file.id === fileId);
    if (fileToUpdate) {
      dispatch(updateEntity({ ...fileToUpdate, status: newStatus }));
    }
  };

  const filteredFileList = fileList.filter(
    file => statusFilter === 'ALL' || file.status === statusFilter || (!file.status && statusFilter === FileStatus.DRAFT),
  );

  return (
    <div>
      <h2 id="file-heading" data-cy="FileHeading">
        Files
        <div className="d-flex justify-content-end">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh list
          </Button>
          <Link to="/file/new" className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create a new File
          </Link>
        </div>
      </h2>
      <div className="mb-3">
        <div className="d-flex align-items-center">
          <span className="me-2">Filter by Status:</span>
          <UncontrolledDropdown>
            <DropdownToggle color="outline-secondary" size="sm" data-cy="statusFilterDropdown">
              {statusFilter === 'ALL' ? 'All Statuses' : statusFilter}
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => setStatusFilter('ALL')} data-cy="filterOption-ALL">
                All Statuses
              </DropdownItem>
              {Object.values(FileStatus).map(status => (
                <DropdownItem key={status} onClick={() => setStatusFilter(status)} data-cy={`filterOption-${status}`}>
                  <Badge color={getStatusBadgeColor(status)} className="me-2">
                    {status}
                  </Badge>
                  {status}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      </div>
      <div className="table-responsive">
        {filteredFileList && filteredFileList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th className="hand" onClick={sort('id')}>
                  ID <FontAwesomeIcon icon={getSortIconByFieldName('id')} />
                </th>
                <th className="hand" onClick={sort('name')}>
                  Name <FontAwesomeIcon icon={getSortIconByFieldName('name')} />
                </th>
                <th className="hand" onClick={sort('content')}>
                  Content <FontAwesomeIcon icon={getSortIconByFieldName('content')} />
                </th>
                <th className="hand" onClick={sort('status')}>
                  Status <FontAwesomeIcon icon={getSortIconByFieldName('status')} />
                </th>
                <th>
                  Proposal <FontAwesomeIcon icon="sort" />
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredFileList.map((file, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`/file/${file.id}`} color="link" size="sm">
                      {file.id}
                    </Button>
                  </td>
                  <td>{file.name}</td>
                  <td>
                    {file.content ? (
                      <div>
                        {file.contentContentType ? <a onClick={openFile(file.contentContentType, file.content)}>Open &nbsp;</a> : null}
                        <span>
                          {file.contentContentType}, {byteSize(file.content)}
                        </span>
                      </div>
                    ) : null}
                  </td>
                  <td>
                    <Badge color={getStatusBadgeColor(file.status)} data-cy="fileStatus">
                      {file.status || FileStatus.DRAFT}
                    </Badge>
                    <UncontrolledDropdown size="sm" className="ms-2">
                      <DropdownToggle color="link" data-cy="statusDropdown">
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </DropdownToggle>
                      <DropdownMenu>
                        {Object.values(FileStatus).map(status => (
                          <DropdownItem key={status} onClick={() => handleStatusChange(file.id, status)} data-cy={`statusOption-${status}`}>
                            {status}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </td>
                  <td>{file.proposal ? <Link to={`/proposal/${file.proposal.id}`}>{file.proposal.id}</Link> : ''}</td>
                  <td className="text-end">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`/file/${file.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button tag={Link} to={`/file/${file.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button
                        onClick={() => (window.location.href = `/file/${file.id}/delete`)}
                        color="danger"
                        size="sm"
                        data-cy="entityDeleteButton"
                      >
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && (
            <div className="alert alert-warning">
              {statusFilter === 'ALL' ? 'No Files found' : `No Files found with status: ${statusFilter}`}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default File;
