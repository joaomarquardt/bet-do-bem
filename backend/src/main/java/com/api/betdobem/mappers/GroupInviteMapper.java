package com.api.betdobem.mappers;

import com.api.betdobem.domain.GroupInvite;
import com.api.betdobem.dtos.responses.GroupInviteResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface GroupInviteMapper {
    GroupInviteMapper INSTANCE = Mappers.getMapper(GroupInviteMapper.class);

    @Mapping(source = "group.id", target = "groupId")
    @Mapping(source = "group.name", target = "groupName")
    @Mapping(source = "group.description", target = "groupDescription")
    @Mapping(source = "status", target = "status")
    GroupInviteResponse toGroupInviteResponse(GroupInvite groupInvite);

    List<GroupInviteResponse> toGroupInviteResponseList(List<GroupInvite> groupInvites);
}
