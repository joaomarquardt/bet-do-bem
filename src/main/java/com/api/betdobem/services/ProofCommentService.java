package com.api.betdobem.services;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.domain.ProofComment;
import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateCommentRequest;
import com.api.betdobem.dtos.responses.CommentResponse;
import com.api.betdobem.mappers.ProofCommentMapper;
import com.api.betdobem.repositories.ProofCommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProofCommentService {
    private final ProofCommentRepository commentRepository;
    private final ProofCommentMapper commentMapper;
    private final ProofService proofService;
    private final UserService userService;

    public ProofCommentService(ProofCommentRepository commentRepository, ProofCommentMapper commentMapper, ProofService proofService, UserService userService) {
        this.commentRepository = commentRepository;
        this.commentMapper = commentMapper;
        this.proofService = proofService;
        this.userService = userService;
    }

    public List<CommentResponse> getCommentsByProofId(Long proofId) {
        List<ProofComment> comments = commentRepository.findCommentsForProof(proofId);
        return commentMapper.toCommentResponseList(comments);
    }

    public CommentResponse addComment(Long proofId, CreateCommentRequest commentRequest) {
        Proof proof = proofService.getProofEntityById(proofId);
        User author = userService.getUserEntityById(commentRequest.authorId());
        ProofComment comment = commentMapper.toCommentEntity(commentRequest);
        comment.setProof(proof);
        comment.setAuthor(author);
        ProofComment savedComment = commentRepository.save(comment);
        return commentMapper.toCommentResponse(savedComment);
    }

}
