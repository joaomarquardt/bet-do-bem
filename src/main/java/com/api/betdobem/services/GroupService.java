package com.api.betdobem.services;

import com.api.betdobem.domain.Group;
import com.api.betdobem.repositories.GroupRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupService {
    private GroupRepository groupRepository;

    public GroupService(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    public List<Group> getAllGroups() {
        return null;
    }

    public Group createGroup(Group group) {
        return null;
    }

    public Group getGroupById(Long id) {
        return null;
    }

    public Group updateGroup(Long id, Group group) {
        return null;
    }

    public void deleteGroup(Long id) {
    }
}
