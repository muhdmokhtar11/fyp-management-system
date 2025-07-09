import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Proposal from './proposal';
import ProposalDetail from './proposal-detail';
import ProposalUpdate from './proposal-update';
import ProposalDeleteDialog from './proposal-delete-dialog';

const ProposalRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Proposal />} />
    <Route path="new" element={<ProposalUpdate />} />
    <Route path=":id">
      <Route index element={<ProposalDetail />} />
      <Route path="edit" element={<ProposalUpdate />} />
      <Route path="delete" element={<ProposalDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default ProposalRoutes;
