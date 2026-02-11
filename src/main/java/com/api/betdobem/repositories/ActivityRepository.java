package com.api.betdobem.repositories;

import com.api.betdobem.domain.Activity;
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
}
