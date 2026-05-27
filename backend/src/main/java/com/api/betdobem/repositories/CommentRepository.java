package com.api.betdobem.repositories;

import com.api.betdobem.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    @Query("""
        SELECT c.id, c.content, u.name, c.postedAt
        FROM Comment c
        JOIN c.author u
        WHERE c.proof.id = :proofId
    """)
    List<Comment> findCommentsForProof(@Param("proofId") Long proofId);
}
