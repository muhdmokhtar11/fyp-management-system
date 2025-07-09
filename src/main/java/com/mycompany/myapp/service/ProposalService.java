package com.mycompany.myapp.service;

import com.mycompany.myapp.domain.Proposal;
import com.mycompany.myapp.repository.ProposalRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.mycompany.myapp.domain.Proposal}.
 */
@Service
@Transactional
public class ProposalService {

    private static final Logger LOG = LoggerFactory.getLogger(ProposalService.class);

    private final ProposalRepository proposalRepository;

    public ProposalService(ProposalRepository proposalRepository) {
        this.proposalRepository = proposalRepository;
    }

    /**
     * Save a proposal.
     *
     * @param proposal the entity to save.
     * @return the persisted entity.
     */
    public Proposal save(Proposal proposal) {
        LOG.debug("Request to save Proposal : {}", proposal);
        return proposalRepository.save(proposal);
    }

    /**
     * Update a proposal.
     *
     * @param proposal the entity to save.
     * @return the persisted entity.
     */
    public Proposal update(Proposal proposal) {
        LOG.debug("Request to update Proposal : {}", proposal);
        return proposalRepository.save(proposal);
    }

    /**
     * Partially update a proposal.
     *
     * @param proposal the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Proposal> partialUpdate(Proposal proposal) {
        LOG.debug("Request to partially update Proposal : {}", proposal);

        return proposalRepository
            .findById(proposal.getId())
            .map(existingProposal -> {
                if (proposal.getTitle() != null) {
                    existingProposal.setTitle(proposal.getTitle());
                }
                if (proposal.getProposalAbstract() != null) {
                    existingProposal.setProposalAbstract(proposal.getProposalAbstract());
                }
                if (proposal.getSubmissionDate() != null) {
                    existingProposal.setSubmissionDate(proposal.getSubmissionDate());
                }
                if (proposal.getMethodology() != null) {
                    existingProposal.setMethodology(proposal.getMethodology());
                }
                if (proposal.getStatus() != null) {
                    existingProposal.setStatus(proposal.getStatus());
                }
                if (proposal.getPlagiarismScore() != null) {
                    existingProposal.setPlagiarismScore(proposal.getPlagiarismScore());
                }

                return existingProposal;
            })
            .map(proposalRepository::save);
    }

    /**
     * Get all the proposals.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Proposal> findAll(Pageable pageable) {
        LOG.debug("Request to get all Proposals");
        return proposalRepository.findAll(pageable);
    }

    /**
     * Get all the proposals with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<Proposal> findAllWithEagerRelationships(Pageable pageable) {
        return proposalRepository.findAllWithEagerRelationships(pageable);
    }

    /**
     * Get one proposal by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Proposal> findOne(Long id) {
        LOG.debug("Request to get Proposal : {}", id);
        return proposalRepository.findOneWithEagerRelationships(id);
    }

    /**
     * Delete the proposal by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Proposal : {}", id);
        proposalRepository.deleteById(id);
    }
}
