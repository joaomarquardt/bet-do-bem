package com.api.betdobem.mappers;

import com.api.betdobem.domain.Comment;
import com.api.betdobem.dtos.requests.CreateCommentRequest;
import com.api.betdobem.dtos.responses.CommentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CommentMapper {
    CommentMapper INSTANCE = Mappers.getMapper(CommentMapper.class);

    Comment toCommentEntity(CreateCommentRequest request);

    @Mapping(source = "author.id", target = "authorId")
    @Mapping(source = "author.fullName", target = "authorFullName")
    @Mapping(source = "author.username", target = "authorUsername")
    CommentResponse toCommentResponse(Comment comment);

    @Mapping(source = "author.id", target = "authorId")
    @Mapping(source = "author.fullName", target = "authorName")
    @Mapping(source = "author.username", target = "authorUsername")
    List<CommentResponse> toCommentResponseList(List<Comment> comments);
}

