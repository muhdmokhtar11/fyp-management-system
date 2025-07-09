package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.domain.File;
import com.mycompany.myapp.repository.FileRepository;
import com.mycompany.myapp.service.FileService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.mycompany.myapp.domain.File}.
 */
@RestController
@RequestMapping("/api/files")
public class FileResource {

    private static final Logger LOG = LoggerFactory.getLogger(FileResource.class);

    private static final String ENTITY_NAME = "file";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final FileService fileService;

    private final FileRepository fileRepository;

    public FileResource(FileService fileService, FileRepository fileRepository) {
        this.fileService = fileService;
        this.fileRepository = fileRepository;
    }

    /**
     * {@code POST  /files} : Create a new file.
     *
     * @param file the file to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new file, or with status {@code 400 (Bad Request)} if the file has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<File> createFile(@Valid @RequestBody File file) throws URISyntaxException {
        LOG.debug("REST request to save File : {}", file);
        if (file.getId() != null) {
            throw new BadRequestAlertException("A new file cannot already have an ID", ENTITY_NAME, "idexists");
        }
        file = fileService.save(file);
        return ResponseEntity.created(new URI("/api/files/" + file.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, file.getId().toString()))
            .body(file);
    }

    /**
     * {@code PUT  /files/:id} : Updates an existing file.
     *
     * @param id the id of the file to save.
     * @param file the file to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated file,
     * or with status {@code 400 (Bad Request)} if the file is not valid,
     * or with status {@code 500 (Internal Server Error)} if the file couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<File> updateFile(@PathVariable(value = "id", required = false) final Long id, @Valid @RequestBody File file)
        throws URISyntaxException {
        LOG.debug("REST request to update File : {}, {}", id, file);
        if (file.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, file.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!fileRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        file = fileService.update(file);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, file.getId().toString()))
            .body(file);
    }

    /**
     * {@code PATCH  /files/:id} : Partial updates given fields of an existing file, field will ignore if it is null
     *
     * @param id the id of the file to save.
     * @param file the file to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated file,
     * or with status {@code 400 (Bad Request)} if the file is not valid,
     * or with status {@code 404 (Not Found)} if the file is not found,
     * or with status {@code 500 (Internal Server Error)} if the file couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<File> partialUpdateFile(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody File file
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update File partially : {}, {}", id, file);
        if (file.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, file.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!fileRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<File> result = fileService.partialUpdate(file);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, file.getId().toString())
        );
    }

    /**
     * {@code GET  /files} : get all the files.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of files in body.
     */
    @GetMapping("")
    public List<File> getAllFiles() {
        LOG.debug("REST request to get all Files");
        return fileService.findAll();
    }

    /**
     * {@code GET  /files/:id} : get the "id" file.
     *
     * @param id the id of the file to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the file, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<File> getFile(@PathVariable("id") Long id) {
        LOG.debug("REST request to get File : {}", id);
        Optional<File> file = fileService.findOne(id);
        return ResponseUtil.wrapOrNotFound(file);
    }

    /**
     * {@code DELETE  /files/:id} : delete the "id" file.
     *
     * @param id the id of the file to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete File : {}", id);
        fileService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
