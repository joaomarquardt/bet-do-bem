package com.api.betdobem.repositories;

import com.api.betdobem.domain.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    boolean existsByProofIdAndVoterId(Long proofId, Long voterId);

    long countByProofIdAndApprovedTrue(Long proofId);
}
