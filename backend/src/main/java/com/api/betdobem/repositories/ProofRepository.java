package com.api.betdobem.repositories;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.enums.ContextType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProofRepository extends JpaRepository<Proof, Long> {
    @Query(value =
        """
        SELECT 'BET' as type FROM bet_proofs WHERE proof_id = :proofId
        UNION ALL
        SELECT 'CHALLENGE' as type FROM challenge_proofs WHERE proof_id = :proofId
        UNION ALL
        SELECT 'ACTIVITY' as type FROM activity_proofs WHERE proof_id = :proofId
        """, nativeQuery = true)
    ContextType findContextTypeByProofId(@Param("proofId") Long proofId);

    @Query(value = """
        SELECT COALESCE(
            (SELECT bet_id FROM bet_proofs WHERE proof_id = :proofId),
            (SELECT activity_id FROM activity_proofs WHERE proof_id = :proofId),
            (SELECT challenge_id FROM challenge_proofs WHERE proof_id = :proofId)
        ) AS associated_entity_id;
        """, nativeQuery = true)
    long getContextItemIdByProofId(@Param("proofId") Long proofId);

    @Query(value = """
        SELECT COALESCE(
            (SELECT proof_id FROM bet_proofs
             WHERE bet_id = :contextItemId
               AND proof_id != :proofId
               AND EXISTS (SELECT 1 FROM bet_proofs WHERE proof_id = :proofId)),
        
            (SELECT proof_id FROM challenge_proofs
             WHERE challenge_id = :contextItemId
               AND proof_id != :proofId
               AND EXISTS (SELECT 1 FROM challenge_proofs WHERE proof_id = :proofId))
        )
        """, nativeQuery = true)
    Long getOtherProofIdByContextItemIdAndProofId(@Param("contextItemId") Long contextItemId, @Param("proofId") Long proofId);
}
