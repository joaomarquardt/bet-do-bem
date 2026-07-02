package com.api.betdobem.mappers;

import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateUserRequest;
import com.api.betdobem.dtos.requests.UpdateUserRequest;
import com.api.betdobem.dtos.responses.UserProfileResponse;
import com.api.betdobem.dtos.responses.UserResponse;
import com.api.betdobem.services.S3StorageService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class UserMapper {
    @Autowired
    private S3StorageService s3StorageService;

    public abstract User toUserEntity(CreateUserRequest request);

    @Mapping(source = "profilePictureUrl", target = "profilePictureUrl", qualifiedByName = "generateS3Url")
    public abstract UserResponse toUserResponse(User user);

    @Mapping(source = "user.profilePictureUrl", target = "profilePictureUrl", qualifiedByName = "generateS3Url")
    public abstract UserProfileResponse toUserProfileResponse(User user, Long winningBets, Long registeredActivities, Long computedVotes);

    public abstract List<UserResponse> toUserResponseList(List<User> users);

    @Mapping(target = "id", ignore = true)
    public abstract void updateUserRequest(UpdateUserRequest request, @MappingTarget User user);

    @Named("generateS3Url")
    protected String generateS3Url(String imagePath) {
        if (imagePath == null || imagePath.trim().isEmpty()) {
            return null;
        }
        if (imagePath.startsWith("http")) {
            return imagePath;
        }
        return s3StorageService.generatePresignedDownloadUrl(imagePath);
    }
}
