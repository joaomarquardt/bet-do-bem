package com.api.betdobem.mappers;

import com.api.betdobem.domain.Comment;
import com.api.betdobem.dtos.requests.CreateCommentRequest;
import com.api.betdobem.dtos.responses.CommentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class CommentMapper {
    @Value("${aws.cloudfront.domain.name}")
    private String cloudFrontDomainName;

    public abstract Comment toCommentEntity(CreateCommentRequest request);

    @Mapping(source = "author.id", target = "authorId")
    @Mapping(source = "author.fullName", target = "authorFullName")
    @Mapping(source = "author.username", target = "authorUsername")
    @Mapping(source = "author.profilePictureUrl", target = "authorProfilePictureUrl", qualifiedByName = "imagePathToCdnUrl")
    public abstract CommentResponse toCommentResponse(Comment comment);

    @Mapping(source = "author.id", target = "authorId")
    @Mapping(source = "author.fullName", target = "authorName")
    @Mapping(source = "author.username", target = "authorUsername")
    @Mapping(source = "author.profilePictureUrl", target = "authorProfilePictureUrl", qualifiedByName = "imagePathToCdnUrl")
    public abstract List<CommentResponse> toCommentResponseList(List<Comment> comments);

    @Named("imagePathToCdnUrl")
    protected String imagePathToCdnUrl(String imagePath) {
        if (imagePath == null || imagePath.trim().isEmpty()) {
            return null;
        }
        return "https://" + cloudFrontDomainName + "/" + imagePath;
    }
}

