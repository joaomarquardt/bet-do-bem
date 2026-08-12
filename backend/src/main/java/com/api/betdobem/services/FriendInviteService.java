package com.api.betdobem.services;

import com.api.betdobem.domain.FriendInvite;
import com.api.betdobem.domain.Friendship;
import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateFriendInviteRequest;
import com.api.betdobem.dtos.responses.FriendInviteResponse;
import com.api.betdobem.enums.FriendInviteStatus;
import com.api.betdobem.infra.exceptions.DuplicateActionException;
import com.api.betdobem.infra.exceptions.ForbiddenActionException;
import com.api.betdobem.infra.exceptions.InviteNotPendingException;
import com.api.betdobem.infra.exceptions.SelfInteractionException;
import com.api.betdobem.mappers.FriendInviteMapper;
import com.api.betdobem.repositories.FriendInviteRepository;
import com.api.betdobem.repositories.FriendshipRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class FriendInviteService {
    private static final int INVITE_EXPIRATION_DAYS = 7;

    private final FriendInviteRepository friendInviteRepository;
    private final FriendshipRepository friendshipRepository;
    private final FriendInviteMapper friendInviteMapper;
    private final UserService userService;

    public FriendInviteService(FriendInviteRepository friendInviteRepository, FriendshipRepository friendshipRepository, FriendInviteMapper friendInviteMapper, UserService userService) {
        this.friendInviteRepository = friendInviteRepository;
        this.friendshipRepository = friendshipRepository;
        this.friendInviteMapper = friendInviteMapper;
        this.userService = userService;
    }

    public List<FriendInviteResponse> getMyPendingInvites(Long userId) {
        List<FriendInvite> pendingInvites = friendInviteRepository.findByInviteeIdAndStatus(userId, FriendInviteStatus.PENDING);
        return friendInviteMapper.toFriendInviteResponseList(pendingInvites);
    }

    public List<FriendInviteResponse> getMySentPendingInvites(Long userId) {
        List<FriendInvite> pendingInvites = friendInviteRepository.findByInviterIdAndStatus(userId, FriendInviteStatus.PENDING);
        return friendInviteMapper.toFriendInviteResponseList(pendingInvites);
    }

    public FriendInviteResponse createInvite(CreateFriendInviteRequest request, Long inviterId) {
        User invitee = userService.getUserEntityByUsername(request.username());
        Long inviteeId = invitee.getId();
        if (inviteeId.equals(inviterId)) {
            throw new SelfInteractionException("You cannot send a friend request to yourself.");
        }
        if (friendshipRepository.existsFriendship(inviterId, inviteeId)) {
            throw new DuplicateActionException("You are already friends with this user.");
        }
        if (friendInviteRepository.existsByInviterIdAndInviteeIdAndStatus(inviterId, inviteeId, FriendInviteStatus.PENDING)) {
            throw new DuplicateActionException("You already have a pending friend request sent to this user.");
        }
        if (friendInviteRepository.existsByInviterIdAndInviteeIdAndStatus(inviteeId, inviterId, FriendInviteStatus.PENDING)) {
            throw new DuplicateActionException("This user has already sent you a pending friend request.");
        }
        User inviter = userService.getUserEntityById(inviterId);
        Timestamp expiresAt = Timestamp.from(Instant.now().plus(INVITE_EXPIRATION_DAYS, ChronoUnit.DAYS));

        FriendInvite invite = new FriendInvite(inviter, invitee, expiresAt);
        FriendInvite savedInvite = friendInviteRepository.save(invite);
        return friendInviteMapper.toFriendInviteResponse(savedInvite);
    }

    public FriendInviteResponse acceptInvite(Long inviteId, Long userId) {
        FriendInvite invite = friendInviteRepository.findById(inviteId)
                .orElseThrow(() -> new EntityNotFoundException("Invite with ID " + inviteId + " not found."));
        if (!invite.getInvitee().getId().equals(userId)) {
            throw new ForbiddenActionException("Only the invited user can accept this invite.");
        }
        if (invite.getStatus() != FriendInviteStatus.PENDING) {
            throw new InviteNotPendingException("This invite is no longer pending. Current status: " + invite.getStatus());
        }
        invite.setStatus(FriendInviteStatus.ACCEPTED);
        invite.setRespondedAt(Timestamp.from(Instant.now()));
        Friendship friendship = new Friendship(invite.getInviter(), invite.getInvitee());
        friendshipRepository.save(friendship);
        return friendInviteMapper.toFriendInviteResponse(invite);
    }

    public FriendInviteResponse declineInvite(Long inviteId, Long userId) {
        FriendInvite invite = friendInviteRepository.findById(inviteId)
                .orElseThrow(() -> new EntityNotFoundException("Invite with ID " + inviteId + " not found."));
        if (!invite.getInvitee().getId().equals(userId)) {
            throw new ForbiddenActionException("Only the invited user can decline this invite.");
        }
        if (invite.getStatus() != FriendInviteStatus.PENDING) {
            throw new InviteNotPendingException("This invite is no longer pending. Current status: " + invite.getStatus());
        }
        invite.setStatus(FriendInviteStatus.DECLINED);
        invite.setRespondedAt(Timestamp.from(Instant.now()));
        FriendInvite savedInvite = friendInviteRepository.save(invite);
        return friendInviteMapper.toFriendInviteResponse(savedInvite);
    }


    public List<FriendInvite> getAllExpiredPendingInvites() {
        return friendInviteRepository.findByStatusAndExpiresAtBefore(
                FriendInviteStatus.PENDING, Timestamp.from(Instant.now()));
    }

    public void handleExpiredInvite(FriendInvite invite) {
        invite.setStatus(FriendInviteStatus.EXPIRED);
        invite.setRespondedAt(Timestamp.from(Instant.now()));
        friendInviteRepository.save(invite);
    }
}
