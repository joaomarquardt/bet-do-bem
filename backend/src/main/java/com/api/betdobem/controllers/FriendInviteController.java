package com.api.betdobem.controllers;

import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateFriendInviteRequest;
import com.api.betdobem.dtos.responses.FriendInviteResponse;
import com.api.betdobem.services.FriendInviteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friend-invites")
public class FriendInviteController {
    private final FriendInviteService friendInviteService;

    public FriendInviteController(FriendInviteService friendInviteService) {
        this.friendInviteService = friendInviteService;
    }

    @PostMapping
    public ResponseEntity<FriendInviteResponse> createInvite(@Valid @RequestBody CreateFriendInviteRequest request, @AuthenticationPrincipal User loggedUser) {
        FriendInviteResponse invite = friendInviteService.createInvite(request, loggedUser.getId());
        return new ResponseEntity<>(invite, HttpStatus.CREATED);
    }

    @GetMapping("/me/pending")
    public ResponseEntity<List<FriendInviteResponse>> getMyPendingInvites(@AuthenticationPrincipal User loggedUser) {
        List<FriendInviteResponse> invites = friendInviteService.getMyPendingInvites(loggedUser.getId());
        return new ResponseEntity<>(invites, HttpStatus.OK);
    }

    @GetMapping("/me/sent")
    public ResponseEntity<List<FriendInviteResponse>> getMySentPendingInvites(@AuthenticationPrincipal User loggedUser) {
        List<FriendInviteResponse> invites = friendInviteService.getMySentPendingInvites(loggedUser.getId());
        return new ResponseEntity<>(invites, HttpStatus.OK);
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<FriendInviteResponse> acceptInvite(@PathVariable Long id, @AuthenticationPrincipal User loggedUser) {
        FriendInviteResponse invite = friendInviteService.acceptInvite(id, loggedUser.getId());
        return new ResponseEntity<>(invite, HttpStatus.OK);
    }

    @PutMapping("/{id}/decline")
    public ResponseEntity<FriendInviteResponse> declineInvite(@PathVariable Long id, @AuthenticationPrincipal User loggedUser) {
        FriendInviteResponse invite = friendInviteService.declineInvite(id, loggedUser.getId());
        return new ResponseEntity<>(invite, HttpStatus.OK);
    }
}
