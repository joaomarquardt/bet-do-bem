package com.api.betdobem.services;

import com.api.betdobem.domain.Group;
import com.api.betdobem.dtos.requests.GroupRequest;
import com.api.betdobem.dtos.responses.GroupResponse;
import com.api.betdobem.repositories.GroupRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupService {
    private GroupRepository groupRepository;

    public GroupService(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    public List<GroupResponse> getAllGroups() {
        return null;
    }

    public GroupResponse createGroup(GroupRequest group) {
        return null;
    }

    public GroupResponse getGroupById(Long id) {
        return null;
    }

    public GroupResponse updateGroup(Long id, GroupRequest group) {
        return null;
    }

    public void deleteGroup(Long id) {
    }
}
