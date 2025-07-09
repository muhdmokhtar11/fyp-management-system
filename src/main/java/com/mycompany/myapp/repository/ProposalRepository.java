package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Proposal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Proposal entity.
 */
@Repository
public interface ProposalRepository extends JpaRepository<Proposal, Long> {
    @Query("select proposal from Proposal proposal where proposal.student.login = ?#{authentication.name}")
    List<Proposal> findByStudentIsCurrentUser();

    @Query("select proposal from Proposal proposal where proposal.preferredSupervisor.login = ?#{authentication.name}")
    List<Proposal> findByPreferredSupervisorIsCurrentUser();

    default Optional<Proposal> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Proposal> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Proposal> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select proposal from Proposal proposal left join fetch proposal.student left join fetch proposal.preferredSupervisor",
        countQuery = "select count(proposal) from Proposal proposal"
    )
    Page<Proposal> findAllWithToOneRelationships(Pageable pageable);

    @Query("select proposal from Proposal proposal left join fetch proposal.student left join fetch proposal.preferredSupervisor")
    List<Proposal> findAllWithToOneRelationships();

    @Query(
        "select proposal from Proposal proposal left join fetch proposal.student left join fetch proposal.preferredSupervisor where proposal.id =:id"
    )
    Optional<Proposal> findOneWithToOneRelationships(@Param("id") Long id);
}
