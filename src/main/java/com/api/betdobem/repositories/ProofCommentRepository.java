package com.api.betdobem.repositories;

import com.api.betdobem.domain.ProofComment;
import com.api.betdobem.dtos.responses.CommentResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProofCommentRepository extends JpaRepository<ProofComment, Long> {
    @Query("""
        SELECT c.id, c.content, u.username, u.avatarUrl, c.createdAt
        FROM ProofComment c
        JOIN c.author u
        WHERE c.proof.id = :proofId
    """)
    List<ProofComment> findCommentsForProof(@Param("proofId") Long proofId);
}
