package com.api.betdobem.mappers;

import com.api.betdobem.domain.Group;
import com.api.betdobem.dtos.requests.CreateGroupRequest;
import com.api.betdobem.dtos.requests.UpdateGroupRequest;
import com.api.betdobem.dtos.responses.GroupResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface GroupMapper {
    GroupMapper INSTANCE = Mappers.getMapper(GroupMapper.class);

    Group toGroupEntity(CreateGroupRequest request);

    GroupResponse toGroupResponse(Group group);

    List<GroupResponse> toGroupResponseList(List<Group> groups);

    @Mapping(target = "id", ignore = true)
    void updateGroupRequest(UpdateGroupRequest request, @MappingTarget Group group);
}
