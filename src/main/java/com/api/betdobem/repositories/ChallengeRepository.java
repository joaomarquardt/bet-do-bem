package com.api.betdobem.repositories;

import com.api.betdobem.domain.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    @Query(value = """
        SELECT c.* FROM challenges c
        JOIN challenge_proofs cp ON c.id = cp.challenge_id
        WHERE cp.proof_id = :proofId
    """, nativeQuery = true)
    Optional<Challenge> findByProofId(@Param("proofId") Long proofId);
}
