package com.api.betdobem.repositories;

import com.api.betdobem.domain.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    @Query(value = """
        SELECT a.* FROM activities a
        JOIN activity_proofs ap ON a.id = ap.activity_id
        WHERE ap.proof_id = :proofId
    """, nativeQuery = true)
    Optional<Activity> findByProofId(@Param("proofId") Long proofId);
}
