package com.api.betdobem.repositories;

import com.api.betdobem.domain.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GroupRepository extends JpaRepository<Group, Long> {
    @Query("""
            SELECT CASE WHEN COUNT(gm) > 0 THEN true ELSE false END
            FROM Group g
            JOIN g.members gm
            WHERE g.id = :groupId AND gm.id = :userId
            """)
    boolean isUserMemberOfGroup(@Param("groupId") Long groupId, @Param("userId") Long userId);

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
