package com.mycompany.myapp.service;

import com.mycompany.myapp.domain.File;
import com.mycompany.myapp.repository.FileRepository;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.mycompany.myapp.domain.File}.
 */
@Service
@Transactional
public class FileService {

    private static final Logger LOG = LoggerFactory.getLogger(FileService.class);

    private final FileRepository fileRepository;

    public FileService(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    /**
     * Save a file.
     *
     * @param file the entity to save.
     * @return the persisted entity.
     */
    public File save(File file) {
        LOG.debug("Request to save File : {}", file);
        return fileRepository.save(file);
    }

    /**
     * Update a file.
     *
     * @param file the entity to save.
     * @return the persisted entity.
     */
    public File update(File file) {
        LOG.debug("Request to update File : {}", file);
        return fileRepository.save(file);
    }

    /**
     * Partially update a file.
     *
     * @param file the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<File> partialUpdate(File file) {
        LOG.debug("Request to partially update File : {}", file);

        return fileRepository
            .findById(file.getId())
            .map(existingFile -> {
                if (file.getName() != null) {
                    existingFile.setName(file.getName());
                }
                if (file.getContent() != null) {
                    existingFile.setContent(file.getContent());
                }
                if (file.getContentContentType() != null) {
                    existingFile.setContentContentType(file.getContentContentType());
                }

                return existingFile;
            })
            .map(fileRepository::save);
    }

    /**
     * Get all the files.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<File> findAll() {
        LOG.debug("Request to get all Files");
        return fileRepository.findAll();
    }

    /**
     * Get one file by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<File> findOne(Long id) {
        LOG.debug("Request to get File : {}", id);
        return fileRepository.findById(id);
    }

    /**
     * Delete the file by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete File : {}", id);
        fileRepository.deleteById(id);
    }
}
