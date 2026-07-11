package com.api.betdobem.services;

import com.api.betdobem.domain.Group;
import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateGroupRequest;
import com.api.betdobem.dtos.requests.UpdateGroupRequest;
import com.api.betdobem.dtos.responses.GroupResponse;
import com.api.betdobem.infra.exceptions.ActiveItemsInGroupException;
import com.api.betdobem.infra.exceptions.ForbiddenActionException;
import com.api.betdobem.infra.exceptions.GroupCreatorCannotLeaveException;
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
        User creator = userService.getUserEntityById(userId);
        Set<User> membersSet = new HashSet<>();
        membersSet.add(creator);
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

    public List<GroupResponse> getGroupsByUserId(Long userId) {
        List<Group> groups = groupRepository.findByMembersId(userId);
        return groupMapper.toGroupResponseList(groups);
    }

    public GroupResponse updateGroup(Long id, UpdateGroupRequest group) {
        Group existingGroup = getGroupEntityById(id);
        groupMapper.updateGroupRequest(group, existingGroup);
        Group updatedGroup = groupRepository.save(existingGroup);
        return groupMapper.toGroupResponse(updatedGroup);
    }

    public void leaveGroup(Long groupId, Long userId) {
        Group group = getGroupEntityById(groupId);
        if (group.getCreator().getId().equals(userId)) {
            throw new GroupCreatorCannotLeaveException("The group creator cannot leave the group.");
        }
        if (!groupRepository.isUserMemberOfGroup(groupId, userId)) {
            throw new EntityNotFoundException("User is not a member of this group.");
        }
        if (groupRepository.hasActiveBetsInGroup(groupId, userId)) {
            throw new ActiveItemsInGroupException("You cannot leave the group because you have active bets in progress.");
        }
        if (groupRepository.hasActiveChallengesInGroup(groupId, userId)) {
            throw new ActiveItemsInGroupException("You cannot leave the group because you have active challenges in progress.");
        }
        if (groupRepository.hasActiveActivitiesInGroup(groupId, userId)) {
            throw new ActiveItemsInGroupException("You cannot leave the group because you have active activities in judgment.");
        }
        User user = userService.getUserEntityById(userId);
        group.getMembers().remove(user);
        groupRepository.save(group);
    }

    public void removeMember(Long groupId, Long memberIdToRemove, Long requesterId) {
        Group group = getGroupEntityById(groupId);
        if (!group.getCreator().getId().equals(requesterId)) {
            throw new ForbiddenActionException("Only the group creator can remove members.");
        }
        if (memberIdToRemove.equals(requesterId)) {
            throw new GroupCreatorCannotLeaveException("The group creator cannot be removed from the group.");
        }
        if (!groupRepository.isUserMemberOfGroup(groupId, memberIdToRemove)) {
            throw new EntityNotFoundException("User is not a member of this group.");
        }
        if (groupRepository.hasActiveBetsInGroup(groupId, memberIdToRemove)) {
            throw new ActiveItemsInGroupException("Cannot remove member because they have active bets in progress.");
        }
        if (groupRepository.hasActiveChallengesInGroup(groupId, memberIdToRemove)) {
            throw new ActiveItemsInGroupException("Cannot remove member because they have active challenges in progress.");
        }
        if (groupRepository.hasActiveActivitiesInGroup(groupId, memberIdToRemove)) {
            throw new ActiveItemsInGroupException("Cannot remove member because they have active activities in judgment.");
        }
        User member = userService.getUserEntityById(memberIdToRemove);
        group.getMembers().remove(member);
        groupRepository.save(group);
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
