package com.api.betdobem.repositories;

import com.api.betdobem.domain.Comment;
import com.api.betdobem.enums.ContextType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByContextTypeAndContextIdOrderByPostedAtDesc(ContextType contextType, Long contextId, Pageable pageable);
}
