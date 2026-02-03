package com.api.betdobem.mappers;

import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.UserRequest;
import com.api.betdobem.dtos.responses.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    User toUserEntity(UserRequest request);

    UserResponse toUserResponse(User user);

    List<UserResponse> toUserResponseList(List<User> users);

    @Mapping(target = "id", ignore = true)
    void updateUserRequest(UserRequest request, @MappingTarget User user);
}
