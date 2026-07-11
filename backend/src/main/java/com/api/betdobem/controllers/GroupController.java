package com.api.betdobem.controllers;

import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateGroupInviteRequest;
import com.api.betdobem.dtos.requests.CreateGroupRequest;
import com.api.betdobem.dtos.requests.UpdateGroupRequest;
import com.api.betdobem.dtos.responses.GroupInviteResponse;
import com.api.betdobem.dtos.responses.GroupResponse;
import com.api.betdobem.services.GroupInviteService;
import com.api.betdobem.services.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class GroupController {
    private final GroupService groupService;
    private final GroupInviteService groupInviteService;

    public GroupController(GroupService groupService, GroupInviteService groupInviteService) {
        this.groupService = groupService;
        this.groupInviteService = groupInviteService;
    }

    @GetMapping
    public ResponseEntity<List<GroupResponse>> getAllGroups() {
        List<GroupResponse> groups = groupService.getAllGroups();
        return new ResponseEntity<>(groups, HttpStatus.OK);
    }

    @GetMapping("/my")
    public ResponseEntity<List<GroupResponse>> getMyGroups(@AuthenticationPrincipal User loggedUser) {
        List<GroupResponse> groups = groupService.getGroupsByUserId(loggedUser.getId());
        return new ResponseEntity<>(groups, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(@RequestBody @Valid CreateGroupRequest group, @AuthenticationPrincipal User loggedUser) {
        GroupResponse newGroup = groupService.createGroup(group, loggedUser.getId());
        return new ResponseEntity<>(newGroup, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupResponse> getGroupById(@PathVariable Long id) {
        GroupResponse group = groupService.getGroupById(id);
        return new ResponseEntity<>(group, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupResponse> updateGroup(@PathVariable Long id, @RequestBody @Valid UpdateGroupRequest group) {
        GroupResponse updatedGroup = groupService.updateGroup(id, group);
        return new ResponseEntity<>(updatedGroup, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        groupService.deleteGroup(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/{id}/members/me")
    public ResponseEntity<Void> leaveGroup(@PathVariable Long id, @AuthenticationPrincipal User loggedUser) {
        groupService.leaveGroup(id, loggedUser.getId());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long id, @PathVariable Long memberId, @AuthenticationPrincipal User loggedUser) {
        groupService.removeMember(id, memberId, loggedUser.getId());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{id}/invites")
    public ResponseEntity<List<GroupInviteResponse>> sendInvites(@PathVariable Long id, @RequestBody @Valid CreateGroupInviteRequest request, @AuthenticationPrincipal User loggedUser) {
        List<GroupInviteResponse> invites = groupInviteService.createInvites(id, request, loggedUser.getId());
        return new ResponseEntity<>(invites, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/invites")
    public ResponseEntity<List<GroupInviteResponse>> getGroupInvites(@PathVariable Long id, @AuthenticationPrincipal User loggedUser) {
        List<GroupInviteResponse> invites = groupInviteService.getGroupInvites(id, loggedUser.getId());
        return new ResponseEntity<>(invites, HttpStatus.OK);
    }
}
