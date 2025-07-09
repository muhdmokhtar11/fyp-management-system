package com.mycompany.myapp.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ProposalTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Proposal getProposalSample1() {
        return new Proposal().id(1L).title("title1").proposalAbstract("proposalAbstract1").methodology("methodology1");
    }

    public static Proposal getProposalSample2() {
        return new Proposal().id(2L).title("title2").proposalAbstract("proposalAbstract2").methodology("methodology2");
    }

    public static Proposal getProposalRandomSampleGenerator() {
        return new Proposal()
            .id(longCount.incrementAndGet())
            .title(UUID.randomUUID().toString())
            .proposalAbstract(UUID.randomUUID().toString())
            .methodology(UUID.randomUUID().toString());
    }
}
