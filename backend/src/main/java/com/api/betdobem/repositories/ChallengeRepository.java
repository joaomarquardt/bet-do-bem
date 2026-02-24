package com.api.betdobem.repositories;

import com.api.betdobem.domain.Challenge;
import com.api.betdobem.enums.ChallengeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    @Query(value = """
        SELECT c.* FROM challenges c
        JOIN challenge_proofs cp ON c.id = cp.challenge_id
        WHERE cp.proof_id = :proofId
    """, nativeQuery = true)
    Optional<Challenge> findByProofId(@Param("proofId") Long proofId);

    List<Challenge> findByStatusAndDeadlineBefore(ChallengeStatus status, Timestamp now);

    @Query("""
        SELECT c FROM Challenge c
        WHERE c.status = 'IN_JUDGMENT'
        AND c.challenger.id != :userId
        AND c.challenged.id != :userId
        AND NOT EXISTS (
            SELECT v FROM Vote v
            WHERE v.voter.id = :userId
            AND v.proof = c.proof
        )
        ORDER BY c.createdAt DESC
    """)
    List<Challenge> getChallengesRequiringVotingByUserId(@Param("userId") Long userId);

    @Query("""
            SELECT c FROM Challenge c
            WHERE c.status = :status
            AND c.challenged.id = :challengedId
            ORDER BY c.createdAt DESC
            """)
    List<Challenge> findByStatusAndChallengedId(@Param("status") ChallengeStatus status, @Param("challengedId") Long challengedId);
}
