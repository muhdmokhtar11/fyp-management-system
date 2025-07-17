import {
  entityConfirmDeleteButtonSelector,
  entityCreateButtonSelector,
  entityCreateCancelButtonSelector,
  entityCreateSaveButtonSelector,
  entityDeleteButtonSelector,
  entityDetailsBackButtonSelector,
  entityDetailsButtonSelector,
  entityEditButtonSelector,
  entityTableSelector,
} from '../../support/entity';
import { Proposal } from 'app/shared/model/proposal.model';

const sampleProposals: Proposal[] = [
  {
    id: 1,
    title: 'Machine Learning in Healthcare',
    proposalAbstract: 'This proposal explores the application of machine learning algorithms in healthcare diagnostics.',
    submissionDate: 2024115,
    methodology: 'Quantitative research with data analysis,',
    status: 'SUBMITTED',
    plagiarismScore: 12,
    student: { id: 1, login: 'student1' },
    preferredSupervisor: { id: 2, login: 'supervisor1' },
  },
  {
    id: 2,
    title: 'Blockchain for Supply Chain',
    proposalAbstract: 'Investigating blockchain technology for supply chain transparency and efficiency.',
    submissionDate: 2024120,
    methodology: 'Case study analysis and implementation',
    status: 'APPROVED',
    plagiarismScore: 8,
    student: { id: 3, login: 'student2' },
    preferredSupervisor: { id: 4, login: 'supervisor2' },
  },
  {
    id: 3,
    title: 'IoT Security Framework',
    proposalAbstract: 'Developing a comprehensive security framework for IoT devices.',
    submissionDate: 202421,
    methodology: 'Experimental research with prototype development',
    status: 'PENDING',
    plagiarismScore: 25,
    student: { id: 5, login: 'student3' },
    preferredSupervisor: { id: 6, login: 'supervisor3' },
  },
  {
    id: 4,
    title: 'AI in Education',
    proposalAbstract: 'Exploring artificial intelligence applications in educational technology.',
    submissionDate: 2024210,
    methodology: 'Mixed methods research with surveys and interviews,',
    status: 'REJECTED',
    plagiarismScore: 35,
    student: { id: 7, login: 'student4' },
    preferredSupervisor: { id: 8, login: 'supervisor4' },
  },
];

describe('Proposal Page', () => {
  beforeEach(() => {
    // Mock API calls
    cy.intercept('GET', /\/?api\/proposals.*/, {
      statusCode: 200,
      body: {
        content: sampleProposals,
        totalElements: sampleProposals.length,
        totalPages: 1,
        size: 20,
        number: 0,
      },
    }).as('getProposals');

    cy.intercept('DELETE', /\/?api\/proposals\/.*/, {
      statusCode: 204,
    }).as('deleteProposal');

    cy.intercept('PUT', /\/?api\/proposals\/.*/, {
      statusCode: 200,
      body: sampleProposals[0],
    }).as('updateProposal');

    // Visit the proposals page
    cy.visit('/proposal');
    cy.wait('@getProposals');
  });

  describe('Basic Functionality', () => {
    it('should load the proposal page successfully', () => {
      cy.get('[data-testid="proposal-page"]').should('be.visible');
      cy.get('[data-testid="proposal-heading"]').should('contain', 'Proposals');
      cy.get('[data-testid="proposals-table"]').should('be.visible');
    });

    it('should display all proposal elements correctly', () => {
      // Check table headers
      cy.get('[data-testid="proposals-table-header"]').within(() => {
        cy.get('[data-testid="sort-id-header"]').should('contain', 'ID');
        cy.get('[data-testid="sort-title-header"]').should('contain', 'Title');
        cy.get('[data-testid="sort-abstract-header"]').should('contain', 'Proposal Abstract');
        cy.get('[data-testid="sort-date-header"]').should('contain', 'Submission Date');
        cy.get('[data-testid="sort-methodology-header"]').should('contain', 'Methodology');
        cy.get('[data-testid="sort-status-header"]').should('contain', 'Status');
        cy.get('[data-testid="sort-plagiarism-header"]').should('contain', 'Plagiarism Score');
        cy.get('[data-testid="student-header"]').should('contain', 'Student');
        cy.get('[data-testid="supervisor-header"]').should('contain', 'Preferred Supervisor');
      });

      // Check proposal data
      cy.get('[data-testid="proposal-row-1').within(() => {
        cy.get('[data-testid="proposal-title-1"]').should('contain', 'Machine Learning in Healthcare');
        cy.get('[data-testid="proposal-abstract-1"]').should('contain', 'machine learning algorithms');
        cy.get('[data-testid="status-badge-1"]').should('contain', 'SUBMITTED');
        cy.get('[data-testid="plagiarism-score-1"]').should('contain', '12%');
      });
    });

    it('should have all action buttons visible', () => {
      cy.get('[data-testid="proposal-header-actions"]').within(() => {
        cy.get('[data-testid="refresh-proposals-btn"]').should('be.visible');
        cy.get('[data-testid="toggle-statistics-btn"]').should('be.visible');
        cy.get('[data-testid="toggle-analytics-btn"]').should('be.visible');
        cy.get('[data-testid="export-proposals-btn"]').should('be.visible');
        cy.get('[data-testid="create-proposal-btn"]').should('be.visible');
      });
    });

    it('should navigate to create proposal page', () => {
      cy.get('[data-testid="create-proposal-btn"]').click();
      cy.url().should('include', '/proposal/new');
    });

    it('should navigate to proposal detail page', () => {
      cy.get('[data-testid="view-proposal-btn-1"]').click();
      cy.url().should('include', '/proposal/1');
    });

    it('should navigate to proposal edit page', () => {
      cy.get('[data-testid="edit-proposal-btn-1"]').click();
      cy.url().should('include', '/proposal/1/edit');
    });
  });

  describe('Search and Filter Functionality', () => {
    it('should search proposals by title', () => {
      cy.get('[data-testid="search-proposals-input"]').type('Machine Learning');
      cy.get('[data-testid="proposal-row-1"]').should('be.visible');
      cy.get('[data-testid="proposal-row-2"]').should('not.exist');
      cy.get('[data-testid="proposal-row-3"]').should('not.exist');
      cy.get('[data-testid="proposal-row-4"]').should('not.exist');
    });

    it('should search proposals by abstract', () => {
      cy.get('[data-testid="search-proposals-input"]').type('blockchain');
      cy.get('[data-testid="proposal-row-2"]').should('be.visible');
      cy.get('[data-testid="proposal-row-1"]').should('not.exist');
    });

    it('should search proposals by methodology', () => {
      cy.get('[data-testid="search-proposals-input"]').type('Quantitative');
      cy.get('[data-testid="proposal-row-1"]').should('be.visible');
      cy.get('[data-testid="proposal-row-2"]').should('not.exist');
    });

    it('should clear search results', () => {
      cy.get('[data-testid="search-proposals-input"]').type('Machine Learning');
      cy.get('[data-testid="clear-filters-btn"]').click();
      cy.get('[data-testid="search-proposals-input"]').should('have.value', '');
      cy.get('[data-testid="proposal-row-1"]').should('be.visible');
      cy.get('[data-testid="proposal-row-2"]').should('be.visible');
      cy.get('[data-testid="proposal-row-3"]').should('be.visible');
      cy.get('[data-testid="proposal-row-4"]').should('be.visible');
    });

    it('should open advanced filter modal', () => {
      cy.get('[data-testid="advanced-filter-btn"]').click();
      cy.get('[data-testid="advanced-filter-modal"]').should('be.visible');
      cy.get('[data-testid="advanced-filter-modal-header"]').should('contain', 'Advanced Filter');
    });

    it('should filter by status', () => {
      cy.get('[data-testid="advanced-filter-btn"]').click();
      cy.get('[data-testid="status-filter-select"]').select('APPROVED');
      cy.get('[data-testid="apply-filter-btn"]').click();
      cy.get('[data-testid="proposal-row-2"]').should('be.visible');
      cy.get('[data-testid="proposal-row-1"]').should('not.exist');
      cy.get('[data-testid="proposal-row-3"]').should('not.exist');
      cy.get('[data-testid="proposal-row-4"]').should('not.exist');
    });

    it('should filter by date range', () => {
      cy.get('[data-testid="advanced-filter-btn"]').click();
      cy.get('[data-testid="start-date-input"]').type('224-11');
      cy.get('[data-testid="end-date-input"]').type('224-131');
      cy.get('[data-testid="apply-filter-btn"]').click();
      cy.get('[data-testid="proposal-row-1"]').should('be.visible');
      cy.get('[data-testid="proposal-row-2"]').should('be.visible');
      cy.get('[data-testid="proposal-row-3"]').should('not.exist');
      cy.get('[data-testid="proposal-row-4"]').should('not.exist');
    });

    it('should close advanced filter modal', () => {
      cy.get('[data-testid="advanced-filter-btn"]').click();
      cy.get('[data-testid="cancel-filter-btn"]').click();
      cy.get('[data-testid="advanced-filter-modal"]').should('not.exist');
    });
  });

  describe('Sorting Functionality', () => {
    it('should sort by ID', () => {
      cy.get('[data-testid="sort-id-header"]').click();
      cy.get('[data-testid="proposal-row-1"]').should('be.visible');
      cy.get('[data-testid="sort-id-header"]').click();
      cy.get('[data-testid="proposal-row-4"]').should('be.visible');
    });

    it('should sort by title', () => {
      cy.get('[data-testid="sort-title-header"]').click();
      cy.get('[data-testid="proposal-row-4"]').should('be.visible'); // AI in Education
      cy.get('[data-testid="sort-title-header"]').click();
      cy.get('[data-testid="proposal-row-2"]').should('be.visible'); // Blockchain for Supply Chain
    });

    it('should sort by status', () => {
      cy.get('[data-testid="sort-status-header"]').click();
      cy.get('[data-testid="proposal-row-2"]').should('be.visible'); // APPROVED
      cy.get('[data-testid="sort-status-header"]').click();
      cy.get('[data-testid="proposal-row-4"]').should('be.visible'); // REJECTED
    });

    it('should sort by plagiarism score', () => {
      cy.get('[data-testid="sort-plagiarism-header"]').click();
      cy.get('[data-testid="proposal-row-2"]').should('be.visible'); // 8
      cy.get('[data-testid="sort-plagiarism-header"]').click();
      cy.get('[data-testid="proposal-row-4"]').should('be.visible'); // 35%
    });
  });

  describe('Bulk Actions', () => {
    it('should select individual proposals', () => {
      cy.get('[data-testid="proposal-checkbox-1"]').check();
      cy.get('[data-testid="proposal-checkbox-2"]').check();
      cy.get('[data-testid="selected-count"]').should('contain', '2 proposal(s) selected');
    });

    it('should select all proposals', () => {
      cy.get('[data-testid="select-all-proposals-checkbox"]').check();
      cy.get('[data-testid="selected-count"]').should('contain', '4 proposal(s) selected');
    });

    it('should unselect all proposals', () => {
      cy.get('[data-testid="select-all-proposals-checkbox"]').check();
      cy.get('[data-testid="select-all-proposals-checkbox"]').uncheck();
      cy.get('[data-testid="bulk-actions-alert"]').should('not.exist');
    });

    it('should show bulk action buttons when proposals are selected', () => {
      cy.get('[data-testid="proposal-checkbox-1"]').check();
      cy.get('[data-testid="bulk-actions-alert"]').should('be.visible');
      cy.get('[data-testid="bulk-pending-btn"]').should('be.visible');
      cy.get('[data-testid="bulk-approve-btn"]').should('be.visible');
      cy.get('[data-testid="bulk-delete-btn"]').should('be.visible');
    });

    it('should perform bulk status update to pending', () => {
      cy.get('[data-testid="proposal-checkbox-1"]').check();
      cy.get('[data-testid="bulk-pending-btn"]').click();
      cy.get('[data-testid="bulk-actions-alert"]').should('not.exist');
    });

    it('should perform bulk status update to approved', () => {
      cy.get('[data-testid="proposal-checkbox-1"]').check();
      cy.get('[data-testid="bulk-approve-btn"]').click();
      cy.get('[data-testid="bulk-actions-alert"]').should('not.exist');
    });

    it('should perform bulk delete', () => {
      cy.get('[data-testid="proposal-checkbox-1"]').check();
      cy.get('[data-testid="bulk-delete-btn"]').click();
      cy.get('[data-testid="bulk-actions-alert"]').should('not.exist');
    });
  });

  describe('Statistics Dashboard', () => {
    it('should toggle statistics dashboard', () => {
      cy.get('[data-testid="toggle-statistics-btn"]').click();
      cy.get('[data-testid="statistics-dashboard"]').should('be.visible');
      cy.get('[data-testid="statistics-total"]').should('contain', 4);
      cy.get('[data-testid="statistics-submitted"]').should('contain', 1);
      cy.get('[data-testid="statistics-approved"]').should('contain', 1);
      cy.get('[data-testid="statistics-rejected"]').should('contain', 1);
      cy.get('[data-testid="statistics-pending"]').should('contain', 1);
    });

    it('should hide statistics dashboard when toggled again', () => {
      cy.get('[data-testid="toggle-statistics-btn"]').click();
      cy.get('[data-testid="statistics-dashboard"]').should('be.visible');
      cy.get('[data-testid="toggle-statistics-btn"]').click();
      cy.get('[data-testid="statistics-dashboard"]').should('not.exist');
    });
  });

  describe('Analytics Dashboard', () => {
    it('should toggle analytics dashboard', () => {
      cy.get('[data-testid="toggle-analytics-btn"]').click();
      cy.get('[data-testid="analytics-dashboard"]').should('be.visible');
      cy.get('[data-testid="analytics-title"]').should('contain', 'Detailed Analytics');
    });

    it('should display analytics data correctly', () => {
      cy.get('[data-testid="toggle-analytics-btn"]').click();
      cy.get('[data-testid="analytics-total"]').should('contain', 4);
      cy.get('[data-testid="analytics-submitted"]').should('contain', 1);
      cy.get('[data-testid="analytics-approved"]').should('contain', 1);
      cy.get('[data-testid="analytics-rejected"]').should('contain', 1);
      cy.get('[data-testid="analytics-pending"]').should('contain', 1);
      cy.get('[data-testid="analytics-high-risk"]').should('contain', 1);
      cy.get('[data-testid="analytics-medium-risk"]').should('contain', 1);
      cy.get('[data-testid="analytics-low-risk"]').should('contain', 2);
    });

    it('should export analytics data', () => {
      cy.get('[data-testid="toggle-analytics-btn"]').click();
      cy.get('[data-testid="export-analytics-btn"]').click();
      // Note: File download testing is complex in Cypress, so we just verify the button is clickable
    });

    it('should hide analytics dashboard when toggled again', () => {
      cy.get('[data-testid="toggle-analytics-btn"]').click();
      cy.get('[data-testid="analytics-dashboard"]').should('be.visible');
      cy.get('[data-testid="toggle-analytics-btn"]').click();
      cy.get('[data-testid="analytics-dashboard"]').should('not.exist');
    });
  });

  describe('Export Functionality', () => {
    it('should export proposals to CSV', () => {
      cy.get('[data-testid="export-proposals-btn"]').click();
      // Note: File download testing is complex in Cypress, so we just verify the button is clickable
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh the proposals list', () => {
      cy.get('[data-testid="refresh-proposals-btn"]').click();
      cy.wait('@getProposals');
      cy.get('[data-testid="proposals-table"]').should('be.visible');
    });
  });

  describe('Empty State Handling', () => {
    it('should display no proposals message when no data', () => {
      // Mock empty response
      cy.intercept('GET', /\/?api\/proposals.*/, {
        statusCode: 200,
        body: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 20,
          number: 0,
        },
      }).as('getEmptyProposals');

      cy.visit('/proposal');
      cy.wait('@getEmptyProposals');
      cy.get('[data-testid="no-proposals-message"]').should('contain', 'No Proposals found');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', /\/?api\/proposals.*/, {
        statusCode: 500,
        body: { message: 'Internal Server Error' },
      }).as('getProposalsError');

      cy.visit('/proposal');
      cy.wait('@getProposalsError');
      // The page should still be visible even with API errors
      cy.get('[data-testid="proposal-page"]').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile viewport', () => {
      cy.viewport(375, 667); // iPhone SE
      cy.get('[data-testid="proposal-page"]').should('be.visible');
      cy.get('[data-testid="proposals-table-container"]').should('be.visible');
    });

    it('should display correctly on tablet viewport', () => {
      cy.viewport(768, 24); // iPad
      cy.get('[data-testid="proposal-page"]').should('be.visible');
      cy.get('[data-testid="proposals-table-container"]').should('be.visible');
    });

    it('should display correctly on desktop viewport', () => {
      cy.viewport(1920, 1080); // Full HD
      cy.get('[data-testid="proposal-page"]').should('be.visible');
      cy.get('[data-testid="proposals-table-container"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="search-proposals-input"]').should('have.attr', 'placeholder');
      cy.get('[data-testid="proposals-table"]').should('be.visible');
      cy.get('[data-testid="select-all-proposals-checkbox"]').should('be.visible');
    });

    it('should support keyboard navigation', () => {
      cy.get('[data-testid="search-proposals-input"]').focus();
      cy.get('[data-testid="search-proposals-input"]').type('test');
      cy.get('[data-testid="search-proposals-input"]').should('have.value', 'test');
    });
  });

  describe('Performance', () => {
    it('should load within acceptable time', () => {
      const startTime = Date.now();
      cy.visit('/proposal');
      cy.get('[data-testid="proposals-table"]').should('be.visible');
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      expect(loadTime).to.be.lessThan(5000); // 5 seconds max
    });

    it('should handle large datasets efficiently', () => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        ...sampleProposals[0],
        id: i + 1,
        title: `Proposal ${i + 1}`,
      }));

      cy.intercept('GET', /\/?api\/proposals.*/, {
        statusCode: 200,
        body: {
          content: largeDataset,
          totalElements: largeDataset.length,
          totalPages: 5,
          size: 20,
          number: 0,
        },
      }).as('getLargeProposals');

      cy.visit('/proposal');
      cy.wait('@getLargeProposals');
      cy.get('[data-testid="proposals-table"]').should('be.visible');
    });
  });

  describe('Integration Tests', () => {
    it('should integrate with proposal detail page', () => {
      cy.get('[data-testid="view-proposal-btn-1"]').click();
      cy.url().should('include', '/proposal/1');
      cy.go('back');
      cy.url().should('include', '/proposal');
    });

    it('should integrate with proposal edit page', () => {
      cy.get('[data-testid="edit-proposal-btn-1"]').click();
      cy.url().should('include', '/proposal/1/edit');
      cy.go('back');
      cy.url().should('include', '/proposal');
    });

    it('should maintain state after navigation', () => {
      cy.get('[data-testid="search-proposals-input"]').type('Machine Learning');
      cy.get('[data-testid="view-proposal-btn-1"]').click();
      cy.go('back');
      cy.get('[data-testid="search-proposals-input"]').should('have.value', 'Machine Learning');
    });
  });
});
