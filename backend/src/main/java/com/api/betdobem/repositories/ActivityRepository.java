package com.api.betdobem.repositories;

import com.api.betdobem.domain.Activity;
import com.api.betdobem.enums.ActivityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    @Query("SELECT a FROM Activity a WHERE a.proof.id = :proofId")
    Optional<Activity> findByProofId(@Param("proofId") Long proofId);

    List<Activity> findByStatusAndExpiresAtBefore(ActivityStatus status, Timestamp now);

    @Query("""
        SELECT COUNT(a) FROM Activity a
        WHERE a.author.id = :authorId
        AND a.createdAt >= :hoursAgo
        """)
    long countRecentActivities(@Param("authorId") Long authorId, @Param("twentyFourHoursAgo") LocalDateTime hoursAgo);

    @Query("""
            SELECT a FROM Activity a
            WHERE a.status IN :statuses
            AND (a.author.id = :userId)
            ORDER BY a.createdAt DESC
            """)
    List<Activity> findByStatusesAndInvolvedUserId(@Param("statuses") List<ActivityStatus> statuses, @Param("userId") Long userId);

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

    @Query("""
        SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END
        FROM Activity a
        JOIN a.group g
        JOIN g.members u
        WHERE a.id = :activityId AND u.id = :userId
    """)
    boolean canUserViewActivity(@Param("activityId") Long activityId, @Param("userId") Long userId);
}
