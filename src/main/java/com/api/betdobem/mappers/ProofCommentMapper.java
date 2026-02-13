package com.api.betdobem.mappers;

import com.api.betdobem.domain.ProofComment;
import com.api.betdobem.dtos.requests.CreateCommentRequest;
import com.api.betdobem.dtos.responses.CommentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProofCommentMapper {
    ProofCommentMapper INSTANCE = Mappers.getMapper(ProofCommentMapper.class);

    ProofComment toCommentEntity(CreateCommentRequest request);

    @Mapping(source = "author.id", target = "authorId")
    @Mapping(source = "author.name", target = "authorName")
    CommentResponse toCommentResponse(ProofComment comment);

    @Mapping(source = "author.id", target = "authorId")
    @Mapping(source = "author.name", target = "authorName")
    List<CommentResponse> toCommentResponseList(List<ProofComment> comments);
}

