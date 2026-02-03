package com.api.betdobem.mappers;

import com.api.betdobem.domain.Group;
import com.api.betdobem.dtos.requests.GroupRequest;
import com.api.betdobem.dtos.responses.GroupResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GroupMapper {
    GroupMapper INSTANCE = Mappers.getMapper(GroupMapper.class);

    Group toGroupEntity(GroupRequest request);

    GroupResponse toGroupResponse(Group group);

    List<GroupResponse> toGroupResponseList(List<Group> groups);

    @Mapping(target = "id", ignore = true)
    void updateGroupRequest(GroupRequest request, @MappingTarget Group group);
}
