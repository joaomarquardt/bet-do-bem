package com.api.betdobem.controllers;

import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.responses.GroupInviteResponse;
import com.api.betdobem.services.GroupInviteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/group-invites")
public class GroupInviteController {
    private final GroupInviteService groupInviteService;

    public GroupInviteController(GroupInviteService groupInviteService) {
        this.groupInviteService = groupInviteService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<GroupInviteResponse>> getMyPendingInvites(@AuthenticationPrincipal User loggedUser) {
        List<GroupInviteResponse> invites = groupInviteService.getMyPendingInvites(loggedUser.getId());
        return new ResponseEntity<>(invites, HttpStatus.OK);
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<GroupInviteResponse> acceptInvite(@PathVariable Long id, @AuthenticationPrincipal User loggedUser) {
        GroupInviteResponse invite = groupInviteService.acceptInvite(id, loggedUser.getId());
        return new ResponseEntity<>(invite, HttpStatus.OK);
    }

    @PutMapping("/{id}/decline")
    public ResponseEntity<GroupInviteResponse> declineInvite(@PathVariable Long id, @AuthenticationPrincipal User loggedUser) {
        GroupInviteResponse invite = groupInviteService.declineInvite(id, loggedUser.getId());
        return new ResponseEntity<>(invite, HttpStatus.OK);
    }
}
