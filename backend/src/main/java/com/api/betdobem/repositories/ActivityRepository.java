package com.api.betdobem.repositories;

import com.api.betdobem.domain.Activity;
import com.api.betdobem.domain.Bet;
import com.api.betdobem.enums.ActivityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    @Query("SELECT a FROM Activity a WHERE a.proof.id = :proofId")
    Optional<Activity> findByProofId(@Param("proofId") Long proofId);

    List<Activity> findByStatusAndExpiresAtBefore(ActivityStatus status, Timestamp now);

    @Query("""
        SELECT a FROM Activity a
        WHERE a.status = 'IN_JUDGMENT'
        AND a.author.id != :userId
        AND NOT EXISTS (
            SELECT v FROM Vote v
            WHERE v.voter.id = :userId
            AND v.proof = a.proof
        )
        ORDER BY a.createdAt DESC
    """)
    List<Activity> getActivitiesRequiringVotingByUserId(@Param("userId") Long userId);
}
