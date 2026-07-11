package com.api.betdobem.services;

import com.api.betdobem.domain.Group;
import com.api.betdobem.domain.GroupInvite;
import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateGroupInviteRequest;
import com.api.betdobem.dtos.responses.GroupInviteResponse;
import com.api.betdobem.enums.GroupInviteStatus;
import com.api.betdobem.infra.exceptions.DuplicateGroupInviteException;
import com.api.betdobem.infra.exceptions.ForbiddenActionException;
import com.api.betdobem.infra.exceptions.InviteNotPendingException;
import com.api.betdobem.infra.exceptions.SelfInteractionException;
import com.api.betdobem.mappers.GroupInviteMapper;
import com.api.betdobem.repositories.GroupInviteRepository;
import com.api.betdobem.repositories.GroupRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class GroupInviteService {

    private static final int INVITE_EXPIRATION_DAYS = 7;

    private final GroupInviteRepository groupInviteRepository;
    private final GroupInviteMapper groupInviteMapper;
    private final GroupRepository groupRepository;
    private final UserService userService;

    public GroupInviteService(GroupInviteRepository groupInviteRepository, GroupInviteMapper groupInviteMapper,
                              GroupRepository groupRepository, UserService userService) {
        this.groupInviteRepository = groupInviteRepository;
        this.groupInviteMapper = groupInviteMapper;
        this.groupRepository = groupRepository;
        this.userService = userService;
    }

    public List<GroupInviteResponse> createInvites(Long groupId, CreateGroupInviteRequest request, Long inviterId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group with ID " + groupId + " not found."));
        if (!groupRepository.isUserMemberOfGroup(groupId, inviterId)) {
            throw new ForbiddenActionException("Only group members can send invites.");
        }
        User inviter = userService.getUserEntityById(inviterId);
        Timestamp expiresAt = Timestamp.from(Instant.now().plus(INVITE_EXPIRATION_DAYS, ChronoUnit.DAYS));
        List<GroupInvite> createdInvites = new ArrayList<>();
        for (Long inviteeId : request.inviteeIds()) {
            if (inviteeId.equals(inviterId)) {
                throw new SelfInteractionException("You cannot invite yourself to a group.");
            }
            if (groupRepository.isUserMemberOfGroup(groupId, inviteeId)) {
                throw new DuplicateGroupInviteException("User with ID " + inviteeId + " is already a member of this group.");
            }
            if (groupInviteRepository.existsByGroupIdAndInviteeIdAndStatus(groupId, inviteeId, GroupInviteStatus.PENDING)) {
                throw new DuplicateGroupInviteException("User with ID " + inviteeId + " already has a pending invite for this group.");
            }
            User invitee = userService.getUserEntityById(inviteeId);
            GroupInvite invite = new GroupInvite(group, inviter, invitee, expiresAt);
            createdInvites.add(groupInviteRepository.save(invite));
        }
        return groupInviteMapper.toGroupInviteResponseList(createdInvites);
    }

    public List<GroupInviteResponse> getMyPendingInvites(Long userId) {
        List<GroupInvite> invites = groupInviteRepository.findByInviteeIdAndStatus(userId, GroupInviteStatus.PENDING);
        return groupInviteMapper.toGroupInviteResponseList(invites);
    }

    public List<GroupInviteResponse> getGroupInvites(Long groupId, Long userId) {
        if (!groupRepository.isUserMemberOfGroup(groupId, userId)) {
            throw new ForbiddenActionException("Only group members can view group invites.");
        }
        List<GroupInvite> invites = groupInviteRepository.findByGroupIdAndStatus(groupId, GroupInviteStatus.PENDING);
        return groupInviteMapper.toGroupInviteResponseList(invites);
    }

    public GroupInviteResponse acceptInvite(Long inviteId, Long userId) {
        GroupInvite invite = groupInviteRepository.findById(inviteId)
                .orElseThrow(() -> new EntityNotFoundException("Invite with ID " + inviteId + " not found."));
        if (!invite.getInvitee().getId().equals(userId)) {
            throw new ForbiddenActionException("Only the invited user can accept this invite.");
        }
        if (invite.getStatus() != GroupInviteStatus.PENDING) {
            throw new InviteNotPendingException("This invite is no longer pending. Current status: " + invite.getStatus());
        }
        invite.setStatus(GroupInviteStatus.ACCEPTED);
        invite.setRespondedAt(Timestamp.from(Instant.now()));
        Group group = invite.getGroup();
        group.getMembers().add(invite.getInvitee());
        groupRepository.save(group);
        GroupInvite savedInvite = groupInviteRepository.save(invite);
        return groupInviteMapper.toGroupInviteResponse(savedInvite);
    }

    public GroupInviteResponse declineInvite(Long inviteId, Long userId) {
        GroupInvite invite = groupInviteRepository.findById(inviteId)
                .orElseThrow(() -> new EntityNotFoundException("Invite with ID " + inviteId + " not found."));
        if (!invite.getInvitee().getId().equals(userId)) {
            throw new ForbiddenActionException("Only the invited user can decline this invite.");
        }
        if (invite.getStatus() != GroupInviteStatus.PENDING) {
            throw new InviteNotPendingException("This invite is no longer pending. Current status: " + invite.getStatus());
        }
        invite.setStatus(GroupInviteStatus.DECLINED);
        invite.setRespondedAt(Timestamp.from(Instant.now()));
        GroupInvite savedInvite = groupInviteRepository.save(invite);
        return groupInviteMapper.toGroupInviteResponse(savedInvite);
    }

    public List<GroupInvite> getAllExpiredPendingInvites() {
        return groupInviteRepository.findByStatusAndExpiresAtBefore(
                GroupInviteStatus.PENDING, Timestamp.from(Instant.now()));
    }

    public void handleExpiredInvite(GroupInvite invite) {
        invite.setStatus(GroupInviteStatus.EXPIRED);
        invite.setRespondedAt(Timestamp.from(Instant.now()));
        groupInviteRepository.save(invite);
    }
}
