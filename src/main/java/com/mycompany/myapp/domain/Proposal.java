package com.mycompany.myapp.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mycompany.myapp.domain.enumeration.ProposalStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * A Proposal.
 */
@Entity
@Table(name = "proposal")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Proposal implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(min = 5, max = 200)
    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @NotNull
    @Size(min = 20, max = 1000)
    @Column(name = "proposal_abstract", length = 1000, nullable = false)
    private String proposalAbstract;

    @NotNull
    @Column(name = "submission_date", nullable = false)
    private Instant submissionDate;

    @NotNull
    @Size(min = 20, max = 1000)
    @Column(name = "methodology", length = 1000, nullable = false)
    private String methodology;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProposalStatus status;

    @DecimalMin(value = "0")
    @DecimalMax(value = "100")
    @Column(name = "plagiarism_score")
    private Double plagiarismScore;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "proposal")
    @JsonIgnoreProperties(value = { "proposal" }, allowSetters = true)
    private Set<File> files = new HashSet<>();

    @ManyToOne(optional = false)
    @NotNull
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    private User preferredSupervisor;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Proposal id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return this.title;
    }

    public Proposal title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getProposalAbstract() {
        return this.proposalAbstract;
    }

    public Proposal proposalAbstract(String proposalAbstract) {
        this.setProposalAbstract(proposalAbstract);
        return this;
    }

    public void setProposalAbstract(String proposalAbstract) {
        this.proposalAbstract = proposalAbstract;
    }

    public Instant getSubmissionDate() {
        return this.submissionDate;
    }

    public Proposal submissionDate(Instant submissionDate) {
        this.setSubmissionDate(submissionDate);
        return this;
    }

    public void setSubmissionDate(Instant submissionDate) {
        this.submissionDate = submissionDate;
    }

    public String getMethodology() {
        return this.methodology;
    }

    public Proposal methodology(String methodology) {
        this.setMethodology(methodology);
        return this;
    }

    public void setMethodology(String methodology) {
        this.methodology = methodology;
    }

    public ProposalStatus getStatus() {
        return this.status;
    }

    public Proposal status(ProposalStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(ProposalStatus status) {
        this.status = status;
    }

    public Double getPlagiarismScore() {
        return this.plagiarismScore;
    }

    public Proposal plagiarismScore(Double plagiarismScore) {
        this.setPlagiarismScore(plagiarismScore);
        return this;
    }

    public void setPlagiarismScore(Double plagiarismScore) {
        this.plagiarismScore = plagiarismScore;
    }

    public Set<File> getFiles() {
        return this.files;
    }

    public void setFiles(Set<File> files) {
        if (this.files != null) {
            this.files.forEach(i -> i.setProposal(null));
        }
        if (files != null) {
            files.forEach(i -> i.setProposal(this));
        }
        this.files = files;
    }

    public Proposal files(Set<File> files) {
        this.setFiles(files);
        return this;
    }

    public Proposal addFile(File file) {
        this.files.add(file);
        file.setProposal(this);
        return this;
    }

    public Proposal removeFile(File file) {
        this.files.remove(file);
        file.setProposal(null);
        return this;
    }

    public User getStudent() {
        return this.student;
    }

    public void setStudent(User user) {
        this.student = user;
    }

    public Proposal student(User user) {
        this.setStudent(user);
        return this;
    }

    public User getPreferredSupervisor() {
        return this.preferredSupervisor;
    }

    public void setPreferredSupervisor(User user) {
        this.preferredSupervisor = user;
    }

    public Proposal preferredSupervisor(User user) {
        this.setPreferredSupervisor(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Proposal)) {
            return false;
        }
        return getId() != null && getId().equals(((Proposal) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Proposal{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", proposalAbstract='" + getProposalAbstract() + "'" +
            ", submissionDate='" + getSubmissionDate() + "'" +
            ", methodology='" + getMethodology() + "'" +
            ", status='" + getStatus() + "'" +
            ", plagiarismScore=" + getPlagiarismScore() +
            "}";
    }
}
