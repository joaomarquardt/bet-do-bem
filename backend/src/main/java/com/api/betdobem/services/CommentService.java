package com.api.betdobem.services;

import com.api.betdobem.domain.*;
import com.api.betdobem.dtos.responses.CommentResponse;
import com.api.betdobem.dtos.responses.PagedResponse;
import com.api.betdobem.enums.ContextType;
import com.api.betdobem.mappers.CommentMapper;
import com.api.betdobem.repositories.CommentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;

    public CommentService(CommentRepository commentRepository, CommentMapper commentMapper) {
        this.commentRepository = commentRepository;
        this.commentMapper = commentMapper;
    }

    public PagedResponse<CommentResponse> getComments(ContextType contextType, Long contextId, Pageable pageable) {
        Page<Comment> page = commentRepository.findByContextTypeAndContextIdOrderByPostedAtDesc(
                contextType, contextId, pageable
        );
        Page<CommentResponse> responsePage = page.map(commentMapper::toCommentResponse);
        return new PagedResponse<>(
                responsePage.getContent(),
                responsePage.getNumber(),
                responsePage.getSize(),
                responsePage.getTotalElements(),
                responsePage.getTotalPages(),
                responsePage.hasNext()
        );
    }

    public CommentResponse addComment(ContextType contextType, Long contextId, String content, User user) {
        Comment comment = new Comment();
        comment.setContent(content);
        comment.setAuthor(user);
        comment.setContextType(contextType);
        comment.setContextId(contextId);
        Comment savedComment = commentRepository.save(comment);
        return commentMapper.toCommentResponse(savedComment);
    }

}
