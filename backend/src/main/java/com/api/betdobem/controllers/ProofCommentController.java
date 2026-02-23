package com.api.betdobem.controllers;

import com.api.betdobem.dtos.requests.CreateCommentRequest;
import com.api.betdobem.dtos.responses.CommentResponse;
import com.api.betdobem.services.ProofCommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proofs/{proofId}/comments")
public class ProofCommentController {
    private final ProofCommentService commentService;

    public ProofCommentController(ProofCommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getCommentsByProofId(@PathVariable Long proofId) {
        List<CommentResponse> comments = commentService.getCommentsByProofId(proofId);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long proofId, @RequestBody @Valid CreateCommentRequest commentRequest) {
        CommentResponse newComment = commentService.addComment(proofId, commentRequest);
        return new ResponseEntity<>(newComment, HttpStatus.CREATED);
    }
}
