package com.mycompany.myapp.domain;

import static com.mycompany.myapp.domain.FileTestSamples.*;
import static com.mycompany.myapp.domain.ProposalTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.mycompany.myapp.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class ProposalTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Proposal.class);
        Proposal proposal1 = getProposalSample1();
        Proposal proposal2 = new Proposal();
        assertThat(proposal1).isNotEqualTo(proposal2);

        proposal2.setId(proposal1.getId());
        assertThat(proposal1).isEqualTo(proposal2);

        proposal2 = getProposalSample2();
        assertThat(proposal1).isNotEqualTo(proposal2);
    }

    @Test
    void fileTest() {
        Proposal proposal = getProposalRandomSampleGenerator();
        File fileBack = getFileRandomSampleGenerator();

        proposal.addFile(fileBack);
        assertThat(proposal.getFiles()).containsOnly(fileBack);
        assertThat(fileBack.getProposal()).isEqualTo(proposal);

        proposal.removeFile(fileBack);
        assertThat(proposal.getFiles()).doesNotContain(fileBack);
        assertThat(fileBack.getProposal()).isNull();

        proposal.files(new HashSet<>(Set.of(fileBack)));
        assertThat(proposal.getFiles()).containsOnly(fileBack);
        assertThat(fileBack.getProposal()).isEqualTo(proposal);

        proposal.setFiles(new HashSet<>());
        assertThat(proposal.getFiles()).doesNotContain(fileBack);
        assertThat(fileBack.getProposal()).isNull();
    }
}
