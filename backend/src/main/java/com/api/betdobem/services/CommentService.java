package com.api.betdobem.services;

import com.api.betdobem.domain.*;
import com.api.betdobem.dtos.requests.CreateCommentRequest;
import com.api.betdobem.dtos.responses.CommentResponse;
import com.api.betdobem.enums.ContextType;
import com.api.betdobem.infra.exceptions.UnauthorizedActionException;
import com.api.betdobem.mappers.CommentMapper;
import com.api.betdobem.repositories.CommentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;
    private final UserService userService;
    private final ActivityService activityService;
    private final BetService betService;
    private final ChallengeService challengeService;

    public CommentService(CommentRepository commentRepository, CommentMapper commentMapper, UserService userService, ActivityService activityService, BetService betService, ChallengeService challengeService) {
        this.commentRepository = commentRepository;
        this.commentMapper = commentMapper;
        this.userService = userService;
        this.activityService = activityService;
        this.betService = betService;
        this.challengeService = challengeService;
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
