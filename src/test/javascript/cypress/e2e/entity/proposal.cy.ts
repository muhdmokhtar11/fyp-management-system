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

describe('Proposal e2e test', () => {
  const proposalPageUrl = '/proposal';
  const proposalPageUrlPattern = new RegExp('/proposal(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const proposalSample = {"title":"electric","proposalAbstract":"rejigger playfullyXX","submissionDate":"2025-07-08T19:27:30.576Z","methodology":"selfish so mehXXXXXX","status":"APPROVED"};

  let proposal;
  // let user;

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/users',
      body: {"login":"BB","firstName":"Edwin","lastName":"Harris","email":"Millie95@hotmail.com","imageUrl":"weep prime moist"},
    }).then(({ body }) => {
      user = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/proposals+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/proposals').as('postEntityRequest');
    cy.intercept('DELETE', '/api/proposals/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/files', {
      statusCode: 200,
      body: [],
    });

    cy.intercept('GET', '/api/users', {
      statusCode: 200,
      body: [user],
    });

  });
   */

  afterEach(() => {
    if (proposal) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/proposals/${proposal.id}`,
      }).then(() => {
        proposal = undefined;
      });
    }
  });

  /* Disabled due to incompatibility
  afterEach(() => {
    if (user) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/users/${user.id}`,
      }).then(() => {
        user = undefined;
      });
    }
  });
   */

  it('Proposals menu should load Proposals page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('proposal');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Proposal').should('exist');
    cy.url().should('match', proposalPageUrlPattern);
  });

  describe('Proposal page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(proposalPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Proposal page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/proposal/new$'));
        cy.getEntityCreateUpdateHeading('Proposal');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', proposalPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/proposals',
          body: {
            ...proposalSample,
            student: user,
          },
        }).then(({ body }) => {
          proposal = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/proposals+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/proposals?page=0&size=20>; rel="last",<http://localhost/api/proposals?page=0&size=20>; rel="first"',
              },
              body: [proposal],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(proposalPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(proposalPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details Proposal page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('proposal');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', proposalPageUrlPattern);
      });

      it('edit button click should load edit Proposal page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Proposal');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', proposalPageUrlPattern);
      });

      it('edit button click should load edit Proposal page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Proposal');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', proposalPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of Proposal', () => {
        cy.intercept('GET', '/api/proposals/*').as('dialogDeleteRequest');
        cy.get(entityDeleteButtonSelector).last().click();
        cy.wait('@dialogDeleteRequest');
        cy.getEntityDeleteDialogHeading('proposal').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', proposalPageUrlPattern);

        proposal = undefined;
      });
    });
  });

  describe('new Proposal page', () => {
    beforeEach(() => {
      cy.visit(`${proposalPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Proposal');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of Proposal', () => {
      cy.get(`[data-cy="title"]`).type('profane');
      cy.get(`[data-cy="title"]`).should('have.value', 'profane');

      cy.get(`[data-cy="proposalAbstract"]`).type('yowzaXXXXXXXXXXXXXXX');
      cy.get(`[data-cy="proposalAbstract"]`).should('have.value', 'yowzaXXXXXXXXXXXXXXX');

      cy.get(`[data-cy="submissionDate"]`).type('2025-07-09T05:39');
      cy.get(`[data-cy="submissionDate"]`).blur();
      cy.get(`[data-cy="submissionDate"]`).should('have.value', '2025-07-09T05:39');

      cy.get(`[data-cy="methodology"]`).type('axeXXXXXXXXXXXXXXXXX');
      cy.get(`[data-cy="methodology"]`).should('have.value', 'axeXXXXXXXXXXXXXXXXX');

      cy.get(`[data-cy="status"]`).select('APPROVED');

      cy.get(`[data-cy="plagiarismScore"]`).type('67.92');
      cy.get(`[data-cy="plagiarismScore"]`).should('have.value', '67.92');

      cy.get(`[data-cy="student"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        proposal = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', proposalPageUrlPattern);
    });
  });
});
