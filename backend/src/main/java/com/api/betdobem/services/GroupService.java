package com.api.betdobem.services;

import com.api.betdobem.domain.Group;
import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateGroupRequest;
import com.api.betdobem.dtos.requests.UpdateGroupRequest;
import com.api.betdobem.dtos.responses.GroupResponse;
import com.api.betdobem.mappers.GroupMapper;
import com.api.betdobem.repositories.GroupRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class GroupService {
    private GroupRepository groupRepository;
    private GroupMapper groupMapper;
    private UserService userService;

    public GroupService(GroupRepository groupRepository, GroupMapper groupMapper, UserService userService) {
        this.groupRepository = groupRepository;
        this.groupMapper = groupMapper;
        this.userService = userService;
    }

    public List<GroupResponse> getAllGroups() {
        List<Group> groups = groupRepository.findAll();
        return groupMapper.toGroupResponseList(groups);
    }

    public Group getGroupEntityById(Long id) {
        return groupRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Group with ID " + id + " not found."));
    }

    public GroupResponse createGroup(CreateGroupRequest group, Long userId) {
        if (!group.memberIds().contains(userId)) {
            group.memberIds().add(userId);
        }
        User creator = userService.getUserEntityById(userId);
        List<User> membersList = userService.getUserEntitiesByIds(group.memberIds());
        Set<User> membersSet = new HashSet<>(membersList);
        Group newGroup = groupMapper.toGroupEntity(group);
        newGroup.setMembers(membersSet);
        newGroup.setCreator(creator);
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

    public boolean isUserMemberOfGroup(Long groupId, Long userId) {
        return groupRepository.isUserMemberOfGroup(groupId, userId);
    }

    public boolean isUserMemberOfGroupLinkedToProof(Long userId, Long proofId) {
        return groupRepository.isUserMemberOfGroupLinkedToProof(userId, proofId);
    }

    public long findGroupIdByProofId(Long proofId) {
        return groupRepository.findGroupIdByProofId(proofId);
    }

     public long countMembersByGroupId(Long groupId) {
        return groupRepository.countMembersByGroupId(groupId);
    }
}
