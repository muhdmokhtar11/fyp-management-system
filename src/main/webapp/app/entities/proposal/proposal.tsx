import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Table,
  Input,
  Card,
  CardBody,
  CardTitle,
  Row,
  Col,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
} from 'reactstrap';
import { JhiItemCount, JhiPagination, TextFormat, getPaginationState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSort,
  faSortDown,
  faSortUp,
  faSearch,
  faDownload,
  faFilter,
  faChartBar,
  faCheckSquare,
  faSquare,
} from '@fortawesome/free-solid-svg-icons';
import { APP_DATE_FORMAT } from 'app/config/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities } from './proposal.reducer';

export const Proposal = () => {
  const dispatch = useAppDispatch();

  const pageLocation = useLocation();
  const navigate = useNavigate();

  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'id'), pageLocation.search),
  );

  // New state for enhanced features
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProposals, setSelectedProposals] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });
  const [showStatistics, setShowStatistics] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const proposalList = useAppSelector(state => state.proposal.entities);
  const loading = useAppSelector(state => state.proposal.loading);
  const totalItems = useAppSelector(state => state.proposal.totalItems);

  // Calculate statistics
  const calculateStatistics = () => {
    if (!proposalList)
      return {
        total: 0,
        submitted: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        averagePlagiarismScore: 0,
      };
    const stats = {
      total: proposalList.length,
      submitted: proposalList.filter(p => p.status === 'SUBMITTED').length,
      approved: proposalList.filter(p => p.status === 'APPROVED').length,
      rejected: proposalList.filter(p => p.status === 'REJECTED').length,
      pending: proposalList.filter(p => p.status === 'PENDING').length,
      averagePlagiarismScore: proposalList.reduce((sum, p) => sum + (p.plagiarismScore || 0), 0) / (proposalList.length || 1),
    };
    return stats;
  };

  const statistics = calculateStatistics();

  // Filter proposals based on search and filters
  const filteredProposals =
    proposalList?.filter(proposal => {
      const matchesSearch =
        !searchTerm ||
        proposal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.proposalAbstract?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.methodology?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !filterStatus || proposal.status === filterStatus;

      const matchesDateRange =
        !filterDateRange.start ||
        !filterDateRange.end ||
        (proposal.submissionDate &&
          new Date(proposal.submissionDate) >= new Date(filterDateRange.start) &&
          new Date(proposal.submissionDate) <= new Date(filterDateRange.end));

      return matchesSearch && matchesStatus && matchesDateRange;
    }) || [];

  const getAllEntities = () => {
    dispatch(
      getEntities({
        page: paginationState.activePage - 1,
        size: paginationState.itemsPerPage,
        sort: `${paginationState.sort},${paginationState.order}`,
      }),
    );
  };

  const sortEntities = () => {
    getAllEntities();
    const endURL = `?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`;
    if (pageLocation.search !== endURL) {
      navigate(`${pageLocation.pathname}${endURL}`);
    }
  };

  useEffect(() => {
    sortEntities();
  }, [paginationState.activePage, paginationState.order, paginationState.sort]);

  useEffect(() => {
    const params = new URLSearchParams(pageLocation.search);
    const page = params.get('page');
    const sort = params.get(SORT);
    if (page && sort) {
      const sortSplit = sort.split(',');
      setPaginationState({
        ...paginationState,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      });
    }
  }, [pageLocation.search]);

  const sort = p => () => {
    setPaginationState({
      ...paginationState,
      order: paginationState.order === ASC ? DESC : ASC,
      sort: p,
    });
  };

  const handlePagination = currentPage =>
    setPaginationState({
      ...paginationState,
      activePage: currentPage,
    });

  const handleSyncList = () => {
    sortEntities();
  };

  const getSortIconByFieldName = (fieldName: string) => {
    const sortFieldName = paginationState.sort;
    const order = paginationState.order;
    if (sortFieldName !== fieldName) {
      return faSort;
    }
    return order === ASC ? faSortUp : faSortDown;
  };

  // New functions for enhanced features
  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  const handleSelectAll = () => {
    if (selectedProposals.length === filteredProposals.length) {
      setSelectedProposals([]);
    } else {
      setSelectedProposals(filteredProposals.map(p => p.id));
    }
  };

  const handleSelectProposal = (proposalId: number) => {
    setSelectedProposals(prev => (prev.includes(proposalId) ? prev.filter(id => id !== proposalId) : [...prev, proposalId]));
  };

  const handleBulkDelete = () => {
    // Deleting proposals: selectedProposals
    setSelectedProposals([]);
    setShowBulkActions(false);
  };

  const handleBulkStatusUpdate = (newStatus: string) => {
    // Updating proposals to status: newStatus, selectedProposals
    setSelectedProposals([]);
    setShowBulkActions(false);
  };

  const exportProposals = () => {
    const csvContent = [
      ['ID', 'Title', 'Abstract', 'Submission Date', 'Methodology', 'Status', 'Plagiarism Score'],
      ...filteredProposals.map(p => [p.id, p.title, p.proposalAbstract, p.submissionDate, p.methodology, p.status, p.plagiarismScore]),
    ]
      .map(row => row.join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'proposals.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterDateRange({ start: '', end: '' });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      case 'PENDING':
        return 'warning';
      case 'SUBMITTED':
        return 'info';
      default:
        return 'secondary';
    }
  };

  // Analytics functions
  const calculateAnalytics = () => {
    if (!proposalList)
      return {
        total: 0,
        submitted: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        averagePlagiarismScore: 0,
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 0,
      };

    const plagiarismScores = proposalList.map(p => p.plagiarismScore || 0).filter(score => score > 0);
    const averagePlagiarismScore = plagiarismScores.length > 0 ? plagiarismScores.reduce((a, b) => a + b, 0) / plagiarismScores.length : 0;

    return {
      total: proposalList.length,
      submitted: proposalList.filter(p => p.status === 'SUBMITTED').length,
      approved: proposalList.filter(p => p.status === 'APPROVED').length,
      rejected: proposalList.filter(p => p.status === 'REJECTED').length,
      pending: proposalList.filter(p => p.status === 'PENDING').length,
      averagePlagiarismScore,
      highRiskCount: plagiarismScores.filter(score => score > 30).length,
      mediumRiskCount: plagiarismScores.filter(score => score > 15 && score <= 30).length,
      lowRiskCount: plagiarismScores.filter(score => score <= 15).length,
    };
  };

  const analytics = calculateAnalytics();

  const exportAnalytics = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Proposals', analytics.total],
      ['Submitted', analytics.submitted],
      ['Approved', analytics.approved],
      ['Rejected', analytics.rejected],
      ['Pending', analytics.pending],
      ['Average Plagiarism Score', analytics.averagePlagiarismScore.toFixed(2)],
      ['High Risk Proposals (>30)', analytics.highRiskCount],
      ['Medium Risk Proposals (15-30%)', analytics.mediumRiskCount],
      ['Low Risk Proposals (<15%)', analytics.lowRiskCount],
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'proposal-analytics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div data-testid="proposal-page">
      <h2 id="proposal-heading" data-cy="ProposalHeading" data-testid="proposal-heading">
        Proposals
        <div className="d-flex justify-content-end" data-testid="proposal-header-actions">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading} data-testid="refresh-proposals-btn">
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh list
          </Button>
          <Button className="me-2" color="secondary" onClick={() => setShowStatistics(!showStatistics)} data-testid="toggle-statistics-btn">
            <FontAwesomeIcon icon={faChartBar} /> Statistics
          </Button>
          <Button className="me-2" color="warning" onClick={() => setShowAnalytics(!showAnalytics)} data-testid="toggle-analytics-btn">
            <FontAwesomeIcon icon={faChartBar} /> Analytics
          </Button>
          <Button className="me-2" color="success" onClick={exportProposals} data-testid="export-proposals-btn">
            <FontAwesomeIcon icon={faDownload} /> Export
          </Button>
          <Link
            to="/proposal/new"
            className="btn btn-primary jh-create-entity"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            data-testid="create-proposal-btn"
          >
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create a new Proposal
          </Link>
        </div>
      </h2>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="mb-4 p-3 border rounded bg-light" data-testid="analytics-dashboard">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 data-testid="analytics-title">Detailed Analytics</h5>
            <Button color="success" size="sm" onClick={exportAnalytics} data-testid="export-analytics-btn">
              <FontAwesomeIcon icon={faDownload} /> Export Analytics
            </Button>
          </div>
          <Row>
            <Col md={2}>
              <div className="text-center p-2 border rounded bg-white" data-testid="analytics-total">
                <h6>Total</h6>
                <h4 className="text-primary">{analytics.total}</h4>
              </div>
            </Col>
            <Col md={2}>
              <div className="text-center p-2 border rounded bg-white" data-testid="analytics-submitted">
                <h6>Submitted</h6>
                <h4 className="text-info">{analytics.submitted}</h4>
              </div>
            </Col>
            <Col md={2}>
              <div className="text-center p-2 border rounded bg-white" data-testid="analytics-approved">
                <h6>Approved</h6>
                <h4 className="text-success">{analytics.approved}</h4>
              </div>
            </Col>
            <Col md={2}>
              <div className="text-center p-2 border rounded bg-white" data-testid="analytics-rejected">
                <h6>Rejected</h6>
                <h4 className="text-danger">{analytics.rejected}</h4>
              </div>
            </Col>
            <Col md={2}>
              <div className="text-center p-2 border rounded bg-white" data-testid="analytics-pending">
                <h6>Pending</h6>
                <h4 className="text-warning">{analytics.pending}</h4>
              </div>
            </Col>
            <Col md={2}>
              <div className="text-center p-2 border rounded bg-white" data-testid="analytics-avg-plagiarism">
                <h6>Avg Plagiarism</h6>
                <h4 className={analytics.averagePlagiarismScore > 20 ? 'text-danger' : 'text-success'}>
                  {analytics.averagePlagiarismScore.toFixed(1)}%
                </h4>
              </div>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col md={4}>
              <div className="text-center p-2 border rounded bg-white" data-testid="analytics-high-risk">
                <h6>High Risk (&gt;30%)</h6>
                <h4 className="text-danger">{analytics.highRiskCount}</h4>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-2 border rounded bg-white" data-testid="analytics-medium-risk">
                <h6>Medium Risk (15-30%)</h6>
                <h4 className="text-warning">{analytics.mediumRiskCount}</h4>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-2 border rounded bg-white" data-testid="analytics-low-risk">
                <h6>Low Risk (&lt;15%)</h6>
                <h4 className="text-success">{analytics.lowRiskCount}</h4>
              </div>
            </Col>
          </Row>
        </div>
      )}

      {/* Statistics Dashboard */}
      {showStatistics && (
        <Row className="mb-4" data-testid="statistics-dashboard">
          <Col md={2}>
            <Card className="text-center">
              <CardBody>
                <CardTitle tag="h5">Total</CardTitle>
                <h3>{statistics.total}</h3>
              </CardBody>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <CardBody>
                <CardTitle tag="h5">Submitted</CardTitle>
                <h3>{statistics.submitted}</h3>
              </CardBody>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <CardBody>
                <CardTitle tag="h5">Approved</CardTitle>
                <h3>{statistics.approved}</h3>
              </CardBody>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <CardBody>
                <CardTitle tag="h5">Rejected</CardTitle>
                <h3>{statistics.rejected}</h3>
              </CardBody>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <CardBody>
                <CardTitle tag="h5">Pending</CardTitle>
                <h3>{statistics.pending}</h3>
              </CardBody>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center">
              <CardBody>
                <CardTitle tag="h5">Avg Plagiarism</CardTitle>
                <h3>{statistics.averagePlagiarismScore.toFixed(1)}%</h3>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Search and Filter Section */}
      <Row className="mb-3" data-testid="search-filter-section">
        <Col md="6">
          <div className="input-group" data-testid="search-input-group">
            <span className="input-group-text">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <Input
              type="text"
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={handleSearchChange}
              data-cy="proposalSearch"
              data-testid="search-proposals-input"
            />
          </div>
        </Col>
        <Col md="6">
          <div className="d-flex gap-2" data-testid="filter-actions">
            <Button color="outline-secondary" onClick={() => setShowAdvancedFilter(!showAdvancedFilter)} data-testid="advanced-filter-btn">
              <FontAwesomeIcon icon={faFilter} /> Advanced Filter
            </Button>
            {(searchTerm || filterStatus || filterDateRange.start || filterDateRange.end) && (
              <Button color="outline-danger" onClick={clearFilters} data-testid="clear-filters-btn">
                Clear Filters
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Advanced Filter Modal */}
      <Modal isOpen={showAdvancedFilter} toggle={() => setShowAdvancedFilter(false)} data-testid="advanced-filter-modal">
        <ModalHeader toggle={() => setShowAdvancedFilter(false)} data-testid="advanced-filter-modal-header">
          Advanced Filter
        </ModalHeader>
        <ModalBody data-testid="advanced-filter-modal-body">
          <FormGroup>
            <Label for="statusFilter" data-testid="status-filter-label">
              Status
            </Label>
            <Input
              type="select"
              id="statusFilter"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              data-testid="status-filter-select"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PENDING">Pending</option>
            </Input>
          </FormGroup>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="startDate" data-testid="start-date-label">
                  Start Date
                </Label>
                <Input
                  type="date"
                  id="startDate"
                  value={filterDateRange.start}
                  onChange={e => setFilterDateRange(prev => ({ ...prev, start: e.target.value }))}
                  data-testid="start-date-input"
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="endDate" data-testid="end-date-label">
                  End Date
                </Label>
                <Input
                  type="date"
                  id="endDate"
                  value={filterDateRange.end}
                  onChange={e => setFilterDateRange(prev => ({ ...prev, end: e.target.value }))}
                  data-testid="end-date-input"
                />
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter data-testid="advanced-filter-modal-footer">
          <Button color="secondary" onClick={() => setShowAdvancedFilter(false)} data-testid="cancel-filter-btn">
            Cancel
          </Button>
          <Button color="primary" onClick={() => setShowAdvancedFilter(false)} data-testid="apply-filter-btn">
            Apply Filters
          </Button>
        </ModalFooter>
      </Modal>

      {/* Bulk Actions */}
      {selectedProposals.length > 0 && (
        <div className="alert alert-info d-flex justify-content-between align-items-center" data-testid="bulk-actions-alert">
          <span data-testid="selected-count">{selectedProposals.length} proposal(s) selected</span>
          <div data-testid="bulk-action-buttons">
            <Button color="warning" size="sm" onClick={() => handleBulkStatusUpdate('PENDING')} data-testid="bulk-pending-btn">
              Mark as Pending
            </Button>
            <Button color="success" size="sm" onClick={() => handleBulkStatusUpdate('APPROVED')} data-testid="bulk-approve-btn">
              Approve
            </Button>
            <Button color="danger" size="sm" onClick={handleBulkDelete} data-testid="bulk-delete-btn">
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="table-responsive" data-testid="proposals-table-container">
        {filteredProposals && filteredProposals.length > 0 ? (
          <Table responsive data-testid="proposals-table">
            <thead data-testid="proposals-table-header">
              <tr>
                <th data-testid="select-all-header">
                  <Input
                    type="checkbox"
                    checked={selectedProposals.length === filteredProposals.length && filteredProposals.length > 0}
                    onChange={handleSelectAll}
                    data-cy="selectAllProposals"
                    data-testid="select-all-proposals-checkbox"
                  />
                </th>
                <th className="hand" onClick={sort('id')} data-testid="sort-id-header">
                  ID <FontAwesomeIcon icon={getSortIconByFieldName('id')} />
                </th>
                <th className="hand" onClick={sort('title')} data-testid="sort-title-header">
                  Title <FontAwesomeIcon icon={getSortIconByFieldName('title')} />
                </th>
                <th className="hand" onClick={sort('proposalAbstract')} data-testid="sort-abstract-header">
                  Proposal Abstract <FontAwesomeIcon icon={getSortIconByFieldName('proposalAbstract')} />
                </th>
                <th className="hand" onClick={sort('submissionDate')} data-testid="sort-date-header">
                  Submission Date <FontAwesomeIcon icon={getSortIconByFieldName('submissionDate')} />
                </th>
                <th className="hand" onClick={sort('methodology')} data-testid="sort-methodology-header">
                  Methodology <FontAwesomeIcon icon={getSortIconByFieldName('methodology')} />
                </th>
                <th className="hand" onClick={sort('status')} data-testid="sort-status-header">
                  Status <FontAwesomeIcon icon={getSortIconByFieldName('status')} />
                </th>
                <th className="hand" onClick={sort('plagiarismScore')} data-testid="sort-plagiarism-header">
                  Plagiarism Score <FontAwesomeIcon icon={getSortIconByFieldName('plagiarismScore')} />
                </th>
                <th data-testid="student-header">
                  Student <FontAwesomeIcon icon="sort" />
                </th>
                <th data-testid="supervisor-header">
                  Preferred Supervisor <FontAwesomeIcon icon="sort" />
                </th>
                <th data-testid="actions-header" />
              </tr>
            </thead>
            <tbody data-testid="proposals-table-body">
              {filteredProposals.map((proposal, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable" data-testid={`proposal-row-${proposal.id}`}>
                  <td data-testid={`select-proposal-${proposal.id}`}>
                    <Input
                      type="checkbox"
                      checked={selectedProposals.includes(proposal.id)}
                      onChange={() => handleSelectProposal(proposal.id)}
                      data-cy={`selectProposal-${proposal.id}`}
                      data-testid={`proposal-checkbox-${proposal.id}`}
                    />
                  </td>
                  <td data-testid={`proposal-id-${proposal.id}`}>
                    <Button tag={Link} to={`/proposal/${proposal.id}`} color="link" size="sm" data-testid={`proposal-link-${proposal.id}`}>
                      {proposal.id}
                    </Button>
                  </td>
                  <td data-testid={`proposal-title-${proposal.id}`}>{proposal.title}</td>
                  <td data-testid={`proposal-abstract-${proposal.id}`}>{proposal.proposalAbstract}</td>
                  <td data-testid={`proposal-date-${proposal.id}`}>
                    {proposal.submissionDate ? <TextFormat type="date" value={proposal.submissionDate} format={APP_DATE_FORMAT} /> : null}
                  </td>
                  <td data-testid={`proposal-methodology-${proposal.id}`}>{proposal.methodology}</td>
                  <td data-testid={`proposal-status-${proposal.id}`}>
                    <Badge color={getStatusBadgeColor(proposal.status)} data-testid={`status-badge-${proposal.id}`}>
                      {proposal.status}
                    </Badge>
                  </td>
                  <td data-testid={`proposal-plagiarism-${proposal.id}`}>
                    <span
                      className={proposal.plagiarismScore > 20 ? 'text-danger' : 'text-success'}
                      data-testid={`plagiarism-score-${proposal.id}`}
                    >
                      {proposal.plagiarismScore}%
                    </span>
                  </td>
                  <td data-testid={`proposal-student-${proposal.id}`}>{proposal.student ? proposal.student.login : ''}</td>
                  <td data-testid={`proposal-supervisor-${proposal.id}`}>
                    {proposal.preferredSupervisor ? proposal.preferredSupervisor.login : ''}
                  </td>
                  <td className="text-end" data-testid={`proposal-actions-${proposal.id}`}>
                    <div className="btn-group flex-btn-group-container" data-testid={`action-buttons-${proposal.id}`}>
                      <Button
                        tag={Link}
                        to={`/proposal/${proposal.id}`}
                        color="info"
                        size="sm"
                        data-cy="entityDetailsButton"
                        data-testid={`view-proposal-btn-${proposal.id}`}
                      >
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`/proposal/${proposal.id}/edit?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`}
                        color="primary"
                        size="sm"
                        data-cy="entityEditButton"
                        data-testid={`edit-proposal-btn-${proposal.id}`}
                      >
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button
                        onClick={() =>
                          (window.location.href = `/proposal/${proposal.id}/delete?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`)
                        }
                        color="danger"
                        size="sm"
                        data-cy="entityDeleteButton"
                        data-testid={`delete-proposal-btn-${proposal.id}`}
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
            <div className="alert alert-warning" data-testid="no-proposals-message">
              No Proposals found
            </div>
          )
        )}
      </div>
      {totalItems ? (
        <div className={filteredProposals && filteredProposals.length > 0 ? '' : 'd-none'} data-testid="pagination-section">
          <div className="justify-content-center d-flex" data-testid="item-count">
            <JhiItemCount page={paginationState.activePage} total={totalItems} itemsPerPage={paginationState.itemsPerPage} />
          </div>
          <div className="justify-content-center d-flex" data-testid="pagination-controls">
            <JhiPagination
              activePage={paginationState.activePage}
              onSelect={handlePagination}
              maxButtons={5}
              itemsPerPage={paginationState.itemsPerPage}
              totalItems={totalItems}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Proposal;
