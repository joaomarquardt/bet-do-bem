package com.api.betdobem.mappers;

import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateUserRequest;
import com.api.betdobem.dtos.requests.UpdateUserRequest;
import com.api.betdobem.dtos.responses.UserProfileResponse;
import com.api.betdobem.dtos.responses.UserResponse;
import com.api.betdobem.services.S3StorageService;
import jdk.jfr.Name;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class UserMapper {
    @Value("${aws.cloudfront.domain.name}")
    private String cloudFrontDomainName;

    public abstract User toUserEntity(CreateUserRequest request);

    @Mapping(source = "profilePictureUrl", target = "profilePictureUrl", qualifiedByName = "imagePathToCdnUrl")
    public abstract UserResponse toUserResponse(User user);

    @Mapping(source = "user.profilePictureUrl", target = "profilePictureUrl", qualifiedByName = "imagePathToCdnUrl")
    public abstract UserProfileResponse toUserProfileResponse(User user, Long winningBets, Long registeredActivities, Long computedVotes);

    @Mapping(source = "profilePictureUrl", target = "profilePictureUrl", qualifiedByName = "imagePathToCdnUrl")
    public abstract List<UserResponse> toUserResponseList(List<User> users);

    @Mapping(target = "id", ignore = true)
    public abstract void updateUserRequest(UpdateUserRequest request, @MappingTarget User user);

    @Named("imagePathToCdnUrl")
    protected String imagePathToCdnUrl(String imagePath) {
        if (imagePath == null || imagePath.trim().isEmpty()) {
            return null;
        }
        return "https://" + cloudFrontDomainName + "/" + imagePath;
    }
}
