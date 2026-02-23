package com.api.betdobem.repositories;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.enums.ContextType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProofRepository extends JpaRepository<Proof, Long> {
    @Query(value =
        """
        SELECT 'BET' as type FROM bet_proofs WHERE proof_id = :id
        UNION ALL
        SELECT 'CHALLENGE' as type FROM challenge_proofs WHERE proof_id = :id
        UNION ALL
        SELECT 'ACTIVITY' as type FROM activity_proofs WHERE proof_id = :id
        """, nativeQuery = true)
    ContextType findContextTypeByProofId(@Param("id") Long proofId);
}
