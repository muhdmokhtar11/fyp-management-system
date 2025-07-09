package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.domain.Proposal;
import com.mycompany.myapp.repository.ProposalRepository;
import com.mycompany.myapp.service.ProposalService;
import com.mycompany.myapp.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.mycompany.myapp.domain.Proposal}.
 */
@RestController
@RequestMapping("/api/proposals")
public class ProposalResource {

    private static final Logger LOG = LoggerFactory.getLogger(ProposalResource.class);

    private static final String ENTITY_NAME = "proposal";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ProposalService proposalService;

    private final ProposalRepository proposalRepository;

    public ProposalResource(ProposalService proposalService, ProposalRepository proposalRepository) {
        this.proposalService = proposalService;
        this.proposalRepository = proposalRepository;
    }

    /**
     * {@code POST  /proposals} : Create a new proposal.
     *
     * @param proposal the proposal to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new proposal, or with status {@code 400 (Bad Request)} if the proposal has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Proposal> createProposal(@Valid @RequestBody Proposal proposal) throws URISyntaxException {
        LOG.debug("REST request to save Proposal : {}", proposal);
        if (proposal.getId() != null) {
            throw new BadRequestAlertException("A new proposal cannot already have an ID", ENTITY_NAME, "idexists");
        }
        proposal = proposalService.save(proposal);
        return ResponseEntity.created(new URI("/api/proposals/" + proposal.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, proposal.getId().toString()))
            .body(proposal);
    }

    /**
     * {@code PUT  /proposals/:id} : Updates an existing proposal.
     *
     * @param id the id of the proposal to save.
     * @param proposal the proposal to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated proposal,
     * or with status {@code 400 (Bad Request)} if the proposal is not valid,
     * or with status {@code 500 (Internal Server Error)} if the proposal couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Proposal> updateProposal(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Proposal proposal
    ) throws URISyntaxException {
        LOG.debug("REST request to update Proposal : {}, {}", id, proposal);
        if (proposal.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, proposal.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!proposalRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        proposal = proposalService.update(proposal);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, proposal.getId().toString()))
            .body(proposal);
    }

    /**
     * {@code PATCH  /proposals/:id} : Partial updates given fields of an existing proposal, field will ignore if it is null
     *
     * @param id the id of the proposal to save.
     * @param proposal the proposal to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated proposal,
     * or with status {@code 400 (Bad Request)} if the proposal is not valid,
     * or with status {@code 404 (Not Found)} if the proposal is not found,
     * or with status {@code 500 (Internal Server Error)} if the proposal couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Proposal> partialUpdateProposal(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Proposal proposal
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Proposal partially : {}, {}", id, proposal);
        if (proposal.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, proposal.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!proposalRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Proposal> result = proposalService.partialUpdate(proposal);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, proposal.getId().toString())
        );
    }

    /**
     * {@code GET  /proposals} : get all the proposals.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of proposals in body.
     */
    @GetMapping("")
    public ResponseEntity<List<Proposal>> getAllProposals(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of Proposals");
        Page<Proposal> page;
        if (eagerload) {
            page = proposalService.findAllWithEagerRelationships(pageable);
        } else {
            page = proposalService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /proposals/:id} : get the "id" proposal.
     *
     * @param id the id of the proposal to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the proposal, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Proposal> getProposal(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Proposal : {}", id);
        Optional<Proposal> proposal = proposalService.findOne(id);
        return ResponseUtil.wrapOrNotFound(proposal);
    }

    /**
     * {@code DELETE  /proposals/:id} : delete the "id" proposal.
     *
     * @param id the id of the proposal to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProposal(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Proposal : {}", id);
        proposalService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
