package com.api.betdobem.repositories;

import com.api.betdobem.domain.Bet;
import com.api.betdobem.enums.BetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

public interface BetRepository extends JpaRepository<Bet, Long> {

    @Query(value = """
        SELECT b.* FROM bets b
        JOIN bet_proofs bp ON b.id = bp.bet_id
        WHERE bp.proof_id = :proofId
    """, nativeQuery = true)
    Optional<Bet> findByProofId(@Param("proofId") Long proofId);

    List<Bet> findByStatusAndExpiresAtBefore(BetStatus status, Timestamp now);

    @Query("""
        SELECT b FROM Bet b
        WHERE b.status = 'IN_JUDGMENT'
        AND b.creator.id != :userId
        AND b.opponent.id != :userId
        AND NOT EXISTS (
            SELECT v FROM Vote v
            WHERE v.voter.id = :userId
            AND v.proof MEMBER OF b.proofs
        )
        ORDER BY b.createdAt DESC
    """)
    List<Bet> getBetsRequiringVotingByUserId(@Param("userId") Long userId);

    @Query("""
            SELECT b FROM Bet b
            WHERE b.status = :status
            AND b.opponent.id = :opponentId
            ORDER BY b.createdAt DESC
            """)
    List<Bet> findByStatusAndOpponentId(@Param("status") BetStatus status, @Param("opponentId") Long opponentId);

    @Query("""
            SELECT b FROM Bet b
            WHERE b.status IN :statuses
            AND (b.opponent.id = :userId OR b.creator.id = :userId)
            ORDER BY b.createdAt DESC
            """)
    List<Bet> findByStatusesAndInvolvedUserId(@Param("statuses") List<BetStatus> statuses, @Param("userId") Long userId);
}
