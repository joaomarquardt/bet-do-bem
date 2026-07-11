package com.api.betdobem.repositories;

import com.api.betdobem.domain.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupRepository extends JpaRepository<Group, Long> {

    List<Group> findByMembersId(Long userId);

    @Query("""
            SELECT CASE WHEN COUNT(gm) > 0 THEN true ELSE false END
            FROM Group g
            JOIN g.members gm
            WHERE g.id = :groupId AND gm.id = :userId
            """)
    boolean isUserMemberOfGroup(@Param("groupId") Long groupId, @Param("userId") Long userId);

    @Query("""
            SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END
            FROM Bet b
            WHERE b.group.id = :groupId
            AND (b.creator.id = :userId OR b.opponent.id = :userId)
            AND b.status IN ('INVITED', 'IN_PROGRESS', 'IN_JUDGMENT')
            """)
    boolean hasActiveBetsInGroup(@Param("groupId") Long groupId, @Param("userId") Long userId);

    @Query("""
            SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END
            FROM Challenge c
            WHERE c.group.id = :groupId
            AND (c.challenger.id = :userId OR c.challenged.id = :userId)
            AND c.status IN ('INVITED', 'IN_PROGRESS', 'IN_JUDGMENT')
            """)
    boolean hasActiveChallengesInGroup(@Param("groupId") Long groupId, @Param("userId") Long userId);

    @Query("""
            SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END
            FROM Activity a
            WHERE a.group.id = :groupId
            AND a.author.id = :userId
            AND a.status = 'IN_JUDGMENT'
            """)
    boolean hasActiveActivitiesInGroup(@Param("groupId") Long groupId, @Param("userId") Long userId);

    @Query("""
            SELECT CASE WHEN COUNT(gm) > 0 THEN true ELSE false END
            FROM Group g
            JOIN g.members gm
            WHERE gm.id = :userId
            AND (
                EXISTS (
                    SELECT 1
                    FROM Bet b
                    JOIN b.proofs bp
                    WHERE bp.id = :proofId
                    AND b.group.id = g.id
                )
                OR
                EXISTS (
                    SELECT 1
                    FROM Challenge c
                    WHERE c.proof.id = :proofId
                    AND c.group.id = g.id
                )
                OR
                EXISTS (
                    SELECT 1
                    FROM Activity a
                    WHERE a.proof.id = :proofId
                    AND a.group.id = g.id
                )
            )
            """)
    boolean isUserMemberOfGroupLinkedToProof(@Param("userId") Long userId, @Param("proofId") Long proofId);


    @Query(value = "SELECT COUNT(*) FROM group_members WHERE group_id = :groupId", nativeQuery = true)
    long countMembersByGroupId(@Param("groupId") Long groupId);

    @Query(value = """
    SELECT b.group_id FROM bets b
        JOIN bet_proofs bp ON b.id = bp.bet_id WHERE bp.proof_id = :proofId
    UNION
    SELECT c.group_id FROM challenges c
        JOIN challenge_proofs cp ON c.id = cp.challenge_id WHERE cp.proof_id = :proofId
    UNION
    SELECT a.group_id FROM activities a
        JOIN activity_proofs ap ON a.id = ap.activity_id WHERE ap.proof_id = :proofId
    """, nativeQuery = true)
    Long findGroupIdByProofId(@Param("proofId") Long proofId);
}
