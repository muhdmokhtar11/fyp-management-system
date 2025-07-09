package com.mycompany.myapp.web.rest;

import static com.mycompany.myapp.domain.ProposalAsserts.*;
import static com.mycompany.myapp.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mycompany.myapp.IntegrationTest;
import com.mycompany.myapp.domain.Proposal;
import com.mycompany.myapp.domain.User;
import com.mycompany.myapp.domain.enumeration.ProposalStatus;
import com.mycompany.myapp.repository.ProposalRepository;
import com.mycompany.myapp.repository.UserRepository;
import com.mycompany.myapp.service.ProposalService;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link ProposalResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ProposalResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_PROPOSAL_ABSTRACT = "AAAAAAAAAAAAAAAAAAAA";
    private static final String UPDATED_PROPOSAL_ABSTRACT = "BBBBBBBBBBBBBBBBBBBB";

    private static final Instant DEFAULT_SUBMISSION_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_SUBMISSION_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_METHODOLOGY = "AAAAAAAAAAAAAAAAAAAA";
    private static final String UPDATED_METHODOLOGY = "BBBBBBBBBBBBBBBBBBBB";

    private static final ProposalStatus DEFAULT_STATUS = ProposalStatus.SUBMITTED;
    private static final ProposalStatus UPDATED_STATUS = ProposalStatus.UNDER_REVIEW;

    private static final Double DEFAULT_PLAGIARISM_SCORE = 0D;
    private static final Double UPDATED_PLAGIARISM_SCORE = 1D;

    private static final String ENTITY_API_URL = "/api/proposals";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ProposalRepository proposalRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private ProposalRepository proposalRepositoryMock;

    @Mock
    private ProposalService proposalServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restProposalMockMvc;

    private Proposal proposal;

    private Proposal insertedProposal;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Proposal createEntity(EntityManager em) {
        Proposal proposal = new Proposal()
            .title(DEFAULT_TITLE)
            .proposalAbstract(DEFAULT_PROPOSAL_ABSTRACT)
            .submissionDate(DEFAULT_SUBMISSION_DATE)
            .methodology(DEFAULT_METHODOLOGY)
            .status(DEFAULT_STATUS)
            .plagiarismScore(DEFAULT_PLAGIARISM_SCORE);
        // Add required entity
        User user = UserResourceIT.createEntity();
        em.persist(user);
        em.flush();
        proposal.setStudent(user);
        return proposal;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Proposal createUpdatedEntity(EntityManager em) {
        Proposal updatedProposal = new Proposal()
            .title(UPDATED_TITLE)
            .proposalAbstract(UPDATED_PROPOSAL_ABSTRACT)
            .submissionDate(UPDATED_SUBMISSION_DATE)
            .methodology(UPDATED_METHODOLOGY)
            .status(UPDATED_STATUS)
            .plagiarismScore(UPDATED_PLAGIARISM_SCORE);
        // Add required entity
        User user = UserResourceIT.createEntity();
        em.persist(user);
        em.flush();
        updatedProposal.setStudent(user);
        return updatedProposal;
    }

    @BeforeEach
    void initTest() {
        proposal = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedProposal != null) {
            proposalRepository.delete(insertedProposal);
            insertedProposal = null;
        }
    }

    @Test
    @Transactional
    void createProposal() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Proposal
        var returnedProposal = om.readValue(
            restProposalMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(proposal)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Proposal.class
        );

        // Validate the Proposal in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertProposalUpdatableFieldsEquals(returnedProposal, getPersistedProposal(returnedProposal));

        insertedProposal = returnedProposal;
    }

    @Test
    @Transactional
    void createProposalWithExistingId() throws Exception {
        // Create the Proposal with an existing ID
        proposal.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restProposalMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(proposal)))
            .andExpect(status().isBadRequest());

        // Validate the Proposal in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        proposal.setTitle(null);

        // Create the Proposal, which fails.

        restProposalMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(proposal)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkProposalAbstractIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        proposal.setProposalAbstract(null);

        // Create the Proposal, which fails.

        restProposalMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(proposal)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkSubmissionDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        proposal.setSubmissionDate(null);

        // Create the Proposal, which fails.

        restProposalMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(proposal)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMethodologyIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        proposal.setMethodology(null);

        // Create the Proposal, which fails.

        restProposalMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(proposal)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        proposal.setStatus(null);

        // Create the Proposal, which fails.

        restProposalMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(proposal)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllProposals() throws Exception {
        // Initialize the database
        insertedProposal = proposalRepository.saveAndFlush(proposal);

        // Get all the proposalList
        restProposalMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(proposal.getId().intValue())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].proposalAbstract").value(hasItem(DEFAULT_PROPOSAL_ABSTRACT)))
            .andExpect(jsonPath("$.[*].submissionDate").value(hasItem(DEFAULT_SUBMISSION_DATE.toString())))
            .andExpect(jsonPath("$.[*].methodology").value(hasItem(DEFAULT_METHODOLOGY)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].plagiarismScore").value(hasItem(DEFAULT_PLAGIARISM_SCORE)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllProposalsWithEagerRelationshipsIsEnabled() throws Exception {
        when(proposalServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restProposalMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(proposalServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllProposalsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(proposalServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restProposalMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(proposalRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getProposal() throws Exception {
        // Initialize the database
        insertedProposal = proposalRepository.saveAndFlush(proposal);

        // Get the proposal
        restProposalMockMvc
            .perform(get(ENTITY_API_URL_ID, proposal.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(proposal.getId().intValue()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.proposalAbstract").value(DEFAULT_PROPOSAL_ABSTRACT))
            .andExpect(jsonPath("$.submissionDate").value(DEFAULT_SUBMISSION_DATE.toString()))
            .andExpect(jsonPath("$.methodology").value(DEFAULT_METHODOLOGY))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.plagiarismScore").value(DEFAULT_PLAGIARISM_SCORE));
    }

    @Test
    @Transactional
    void getNonExistingProposal() throws Exception {
        // Get the proposal
        restProposalMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingProposal() throws Exception {
        // Initialize the database
        insertedProposal = proposalRepository.saveAndFlush(proposal);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the proposal
        Proposal updatedProposal = proposalRepository.findById(proposal.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedProposal are not directly saved in db
        em.detach(updatedProposal);
        updatedProposal
            .title(UPDATED_TITLE)
            .proposalAbstract(UPDATED_PROPOSAL_ABSTRACT)
            .submissionDate(UPDATED_SUBMISSION_DATE)
            .methodology(UPDATED_METHODOLOGY)
            .status(UPDATED_STATUS)
            .plagiarismScore(UPDATED_PLAGIARISM_SCORE);

        restProposalMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedProposal.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedProposal))
            )
            .andExpect(status().isOk());

        // Validate the Proposal in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedProposalToMatchAllProperties(updatedProposal);
    }

    @Test
    @Transactional
    void putNonExistingProposal() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        proposal.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProposalMockMvc
            .perform(
                put(ENTITY_API_URL_ID, proposal.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(proposal))
            )
            .andExpect(status().isBadRequest());

        // Validate the Proposal in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchProposal() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        proposal.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProposalMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(proposal))
            )
            .andExpect(status().isBadRequest());

        // Validate the Proposal in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamProposal() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        proposal.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProposalMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(proposal)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Proposal in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateProposalWithPatch() throws Exception {
        // Initialize the database
        insertedProposal = proposalRepository.saveAndFlush(proposal);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the proposal using partial update
        Proposal partialUpdatedProposal = new Proposal();
        partialUpdatedProposal.setId(proposal.getId());

        partialUpdatedProposal.submissionDate(UPDATED_SUBMISSION_DATE).status(UPDATED_STATUS);

        restProposalMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedProposal.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedProposal))
            )
            .andExpect(status().isOk());

        // Validate the Proposal in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertProposalUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedProposal, proposal), getPersistedProposal(proposal));
    }

    @Test
    @Transactional
    void fullUpdateProposalWithPatch() throws Exception {
        // Initialize the database
        insertedProposal = proposalRepository.saveAndFlush(proposal);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the proposal using partial update
        Proposal partialUpdatedProposal = new Proposal();
        partialUpdatedProposal.setId(proposal.getId());

        partialUpdatedProposal
            .title(UPDATED_TITLE)
            .proposalAbstract(UPDATED_PROPOSAL_ABSTRACT)
            .submissionDate(UPDATED_SUBMISSION_DATE)
            .methodology(UPDATED_METHODOLOGY)
            .status(UPDATED_STATUS)
            .plagiarismScore(UPDATED_PLAGIARISM_SCORE);

        restProposalMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedProposal.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedProposal))
            )
            .andExpect(status().isOk());

        // Validate the Proposal in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertProposalUpdatableFieldsEquals(partialUpdatedProposal, getPersistedProposal(partialUpdatedProposal));
    }

    @Test
    @Transactional
    void patchNonExistingProposal() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        proposal.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProposalMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, proposal.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(proposal))
            )
            .andExpect(status().isBadRequest());

        // Validate the Proposal in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchProposal() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        proposal.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProposalMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(proposal))
            )
            .andExpect(status().isBadRequest());

        // Validate the Proposal in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamProposal() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        proposal.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProposalMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(proposal)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Proposal in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteProposal() throws Exception {
        // Initialize the database
        insertedProposal = proposalRepository.saveAndFlush(proposal);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the proposal
        restProposalMockMvc
            .perform(delete(ENTITY_API_URL_ID, proposal.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return proposalRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Proposal getPersistedProposal(Proposal proposal) {
        return proposalRepository.findById(proposal.getId()).orElseThrow();
    }

    protected void assertPersistedProposalToMatchAllProperties(Proposal expectedProposal) {
        assertProposalAllPropertiesEquals(expectedProposal, getPersistedProposal(expectedProposal));
    }

    protected void assertPersistedProposalToMatchUpdatableProperties(Proposal expectedProposal) {
        assertProposalAllUpdatablePropertiesEquals(expectedProposal, getPersistedProposal(expectedProposal));
    }
}
