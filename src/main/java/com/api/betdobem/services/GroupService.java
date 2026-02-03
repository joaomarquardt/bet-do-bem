package com.api.betdobem.services;

import com.api.betdobem.domain.Group;
import com.api.betdobem.dtos.requests.CreateGroupRequest;
import com.api.betdobem.dtos.requests.UpdateGroupRequest;
import com.api.betdobem.dtos.responses.GroupResponse;
import com.api.betdobem.mappers.GroupMapper;
import com.api.betdobem.repositories.GroupRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupService {
    private GroupRepository groupRepository;
    private GroupMapper groupMapper;

    public GroupService(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
        this.groupMapper = groupMapper;
    }

    public List<GroupResponse> getAllGroups() {
        List<Group> groups = groupRepository.findAll();
        return groupMapper.toGroupResponseList(groups);
    }

    public Group getGroupEntityById(Long id) {
        return groupRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Group with ID " + id + " not found."));
    }

    public GroupResponse createGroup(CreateGroupRequest group) {
        if (!group.memberIds().contains(group.creatorId())) {
            group.memberIds().add(group.creatorId());
        }
        Group newGroup = groupMapper.toGroupEntity(group);
        Group savedGroup = groupRepository.save(newGroup);
        return groupMapper.toGroupResponse(savedGroup);
    }

    public GroupResponse getGroupById(Long id) {
        Group group = getGroupEntityById(id);
        return groupMapper.toGroupResponse(group);
    }

    public GroupResponse updateGroup(Long id, UpdateGroupRequest group) {
        Group existingGroup = getGroupEntityById(id);
        groupMapper.updateGroupRequest(group, existingGroup);
        Group updatedGroup = groupRepository.save(existingGroup);
        return groupMapper.toGroupResponse(updatedGroup);
    }

    public void deleteGroup(Long id) {
        groupRepository.deleteById(id);
    }
}
