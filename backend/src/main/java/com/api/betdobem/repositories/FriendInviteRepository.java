package com.api.betdobem.repositories;

import com.api.betdobem.domain.FriendInvite;
import com.api.betdobem.enums.FriendInviteStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Timestamp;
import java.util.List;

public interface FriendInviteRepository extends JpaRepository<FriendInvite, Long> {
    List<FriendInvite> findByInviteeIdAndStatus(Long inviteeId, FriendInviteStatus status);

    List<FriendInvite> findByStatusAndExpiresAtBefore(FriendInviteStatus status, Timestamp now);

    boolean existsByInviterIdAndInviteeIdAndStatus(Long inviterId, Long inviteeId, FriendInviteStatus status);
    List<FriendInvite> findByInviterIdAndStatus(Long inviterId, FriendInviteStatus status);
}
