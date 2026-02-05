package com.api.betdobem.repositories;

import com.api.betdobem.domain.Bet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BetRepository extends JpaRepository<Bet, Long> {

    @Query(value = """
        SELECT b.* FROM bets b
        JOIN bet_proofs bp ON b.id = bp.bet_id
        WHERE bp.proof_id = :proofId
    """, nativeQuery = true)
    Optional<Bet> findByProofId(@Param("proofId") Long proofId);
}
