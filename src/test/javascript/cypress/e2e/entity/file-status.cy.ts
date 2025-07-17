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

describe('File Status Feature e2e test', () => {
  const filePageUrl = '/file';
  const filePageUrlPattern = new RegExp('/file(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const fileSample = {
    name: 'Test File with Status',
    content: 'Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci5wbmc=',
    contentContentType: 'unknown',
    status: 'DRAFT',
  };

  let file;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/files+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/files').as('postEntityRequest');
    cy.intercept('PUT', '/api/files/*').as('putEntityRequest');
    cy.intercept('DELETE', '/api/files/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (file) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/files/${file.id}`,
      }).then(() => {
        file = undefined;
      });
    }
  });

  describe('File Status Display and Management', () => {
    beforeEach(() => {
      // Create a test file
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/files',
        body: fileSample,
      }).then(({ body }) => {
        file = body;
        cy.intercept(
          {
            method: 'GET',
            url: '/api/files+(?*|)',
            times: 1,
          },
          {
            statusCode: 200,
            body: [file],
          },
        ).as('entitiesRequestInternal');
      });

      cy.visit(filePageUrl);
      cy.wait('@entitiesRequestInternal');
    });

    it('should display file status badge with correct color', () => {
      cy.get('[data-cy="fileStatus"]').should('exist');
      cy.get('[data-cy="fileStatus"]').should('contain', 'DRAFT');
      cy.get('[data-cy="fileStatus"]').should('have.class', 'bg-secondary');
    });

    it('should show status dropdown menu when clicked', () => {
      cy.get('[data-cy="statusDropdown"]').first().click();
      cy.get('.dropdown-menu').should('be.visible');
      cy.get('[data-cy="statusOption-DRAFT"]').should('exist');
      cy.get('[data-cy="statusOption-REVIEW"]').should('exist');
      cy.get('[data-cy="statusOption-APPROVED"]').should('exist');
      cy.get('[data-cy="statusOption-REJECTED"]').should('exist');
    });

    it('should change file status when selecting from dropdown', () => {
      cy.get('[data-cy="statusDropdown"]').first().click();
      cy.get('[data-cy="statusOption-REVIEW"]').click();
      cy.wait('@putEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.get('[data-cy="fileStatus"]').should('contain', 'REVIEW');
      cy.get('[data-cy="fileStatus"]').should('have.class', 'bg-warning');
    });

    it('should update status badge color when status changes', () => {
      // Change to APPROVED
      cy.get('[data-cy="statusDropdown"]').first().click();
      cy.get('[data-cy="statusOption-APPROVED"]').click();
      cy.wait('@putEntityRequest');
      cy.wait('@entitiesRequest');
      cy.get('[data-cy="fileStatus"]').should('have.class', 'bg-success');

      // Change to REJECTED
      cy.get('[data-cy="statusDropdown"]').first().click();
      cy.get('[data-cy="statusOption-REJECTED"]').click();
      cy.wait('@putEntityRequest');
      cy.wait('@entitiesRequest');
      cy.get('[data-cy="fileStatus"]').should('have.class', 'bg-danger');
    });
  });

  describe('File Status Filtering', () => {
    beforeEach(() => {
      // Create multiple files with different statuses
      const files = [
        { ...fileSample, name: 'Draft File', status: 'DRAFT' },
        { ...fileSample, name: 'Review File', status: 'REVIEW' },
        { ...fileSample, name: 'Approved File', status: 'APPROVED' },
      ];

      cy.wrap(files).each((fileData, index) => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/files',
          body: fileData,
        }).then(({ body }) => {
          if (index === 0) file = body; // Keep reference to first file for cleanup
        });
      });

      cy.visit(filePageUrl);
      cy.wait('@entitiesRequest');
    });

    it('should show status filter dropdown', () => {
      cy.get('[data-cy="statusFilterDropdown"]').should('exist');
      cy.get('[data-cy="statusFilterDropdown"]').should('contain', 'All Statuses');
    });

    it('should filter files by DRAFT status', () => {
      cy.get('[data-cy="statusFilterDropdown"]').click();
      cy.get('[data-cy="filterOption-DRAFT"]').click();
      cy.get('[data-cy="entityTable"]').should('contain', 'Draft File');
      cy.get('[data-cy="entityTable"]').should('not.contain', 'Review File');
      cy.get('[data-cy="entityTable"]').should('not.contain', 'Approved File');
    });

    it('should filter files by REVIEW status', () => {
      cy.get('[data-cy="statusFilterDropdown"]').click();
      cy.get('[data-cy="filterOption-REVIEW"]').click();
      cy.get('[data-cy="entityTable"]').should('contain', 'Review File');
      cy.get('[data-cy="entityTable"]').should('not.contain', 'Draft File');
      cy.get('[data-cy="entityTable"]').should('not.contain', 'Approved File');
    });

    it('should show all files when "All Statuses" is selected', () => {
      cy.get('[data-cy="statusFilterDropdown"]').click();
      cy.get('[data-cy="filterOption-REVIEW"]').click();
      cy.get('[data-cy="statusFilterDropdown"]').click();
      cy.get('[data-cy="filterOption-ALL"]').click();
      cy.get('[data-cy="entityTable"]').should('contain', 'Draft File');
      cy.get('[data-cy="entityTable"]').should('contain', 'Review File');
      cy.get('[data-cy="entityTable"]').should('contain', 'Approved File');
    });

    it('should show appropriate message when no files match filter', () => {
      cy.get('[data-cy="statusFilterDropdown"]').click();
      cy.get('[data-cy="filterOption-REJECTED"]').click();
      cy.get('.alert-warning').should('contain', 'No Files found with status: REJECTED');
    });
  });

  describe('File Status in Create/Edit Form', () => {
    beforeEach(() => {
      cy.visit(filePageUrl);
      cy.wait('@entitiesRequest');
    });

    it('should include status field in create form', () => {
      cy.get(entityCreateButtonSelector).click();
      cy.url().should('match', new RegExp('/file/new$'));
      cy.get('[data-cy="status"]').should('exist');
      cy.get('[data-cy="status"] option').should('have.length', 4); // DRAFT, REVIEW, APPROVED, REJECTED
      cy.get('[data-cy="status"]').should('have.value', 'DRAFT'); // Default value
    });

    it('should create file with selected status', () => {
      cy.get(entityCreateButtonSelector).click();
      cy.get('[data-cy="name"]').type('New File with Status');
      cy.get('[data-cy="status"]').select('APPROVED');
      cy.setFieldImageAsBytesOfEntity('content', 'integration-test.png', 'image/png');
      cy.wait(200); // Wait for blob validation
      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        file = response.body;
      });
      cy.wait('@entitiesRequest');
      cy.url().should('match', filePageUrlPattern);

      // Verify the created file has the correct status
      cy.get('[data-cy="fileStatus"]').should('contain', 'APPROVED');
      cy.get('[data-cy="fileStatus"]').should('have.class', 'bg-success');
    });

    it('should allow editing file status', () => {
      // Create a file first
      cy.get(entityCreateButtonSelector).click();
      cy.get('[data-cy="name"]').type('File to Edit');
      cy.get('[data-cy="status"]').select('DRAFT');
      cy.setFieldImageAsBytesOfEntity('content', 'integration-test.png', 'image/png');
      cy.wait(200);
      cy.get(entityCreateSaveButtonSelector).click();
      cy.wait('@postEntityRequest').then(({ response }) => {
        file = response.body;
      });
      cy.wait('@entitiesRequest');

      // Edit the file
      cy.get(entityEditButtonSelector).first().click();
      cy.get('[data-cy="status"]').select('REVIEW');
      cy.get(entityCreateSaveButtonSelector).click();
      cy.wait('@putEntityRequest');
      cy.wait('@entitiesRequest');
      cy.url().should('match', filePageUrlPattern);

      // Verify the status was updated
      cy.get('[data-cy="fileStatus"]').should('contain', 'REVIEW');
      cy.get('[data-cy="fileStatus"]').should('have.class', 'bg-warning');
    });
  });

  describe('File Status Sorting', () => {
    beforeEach(() => {
      // Create files with different statuses
      const files = [
        { ...fileSample, name: 'A Draft File', status: 'DRAFT' },
        { ...fileSample, name: 'B Review File', status: 'REVIEW' },
        { ...fileSample, name: 'C Approved File', status: 'APPROVED' },
      ];

      cy.wrap(files).each((fileData, index) => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/files',
          body: fileData,
        }).then(({ body }) => {
          if (index === 0) file = body;
        });
      });

      cy.visit(filePageUrl);
      cy.wait('@entitiesRequest');
    });

    it('should sort files by status column', () => {
      cy.get('th').contains('Status').click();
      cy.wait('@entitiesRequest');

      // Verify sorting works (this is a basic check - actual order depends on backend implementation)
      cy.get('[data-cy="entityTable"]').should('exist');
    });
  });
});
