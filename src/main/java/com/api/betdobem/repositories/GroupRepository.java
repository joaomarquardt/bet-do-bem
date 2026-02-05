package com.api.betdobem.repositories;

import com.api.betdobem.domain.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GroupRepository extends JpaRepository<Group, Long> {
    @Query(value = """
            SELECT COUNT(*) > 0
            FROM group_members gm
            WHERE gm.group_id = :groupId AND gm.user_id = :userId
            """, nativeQuery = true)
    boolean isUserMemberOfGroup(@Param("groupId") Long groupId, @Param("userId") Long userId);

    @Query(value = """
    SELECT COUNT(*) > 0
    FROM group_members gm
    WHERE gm.user_id = :userId
    AND (
        EXISTS (
            SELECT 1
            FROM bets b
            JOIN bet_proofs bp ON b.id = bp.bet_id
            WHERE bp.proof_id = :proofId
            AND b.group_id = gm.group_id
        )
        OR
        EXISTS (
            SELECT 1
            FROM challenges c
            JOIN challenge_proofs cp ON c.id = cp.challenge_id
            WHERE cp.proof_id = :proofId
            AND c.group_id = gm.group_id
        )
        OR
        EXISTS (
            SELECT 1
            FROM activities a
            JOIN activity_proofs ap ON a.id = ap.activity_id
            WHERE ap.proof_id = :proofId
            AND a.group_id = gm.group_id
        )
    )
    """, nativeQuery = true)
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
