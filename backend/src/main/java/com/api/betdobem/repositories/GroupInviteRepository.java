package com.api.betdobem.repositories;

import com.api.betdobem.domain.GroupInvite;
import com.api.betdobem.enums.GroupInviteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.sql.Timestamp;
import java.util.List;

public interface GroupInviteRepository extends JpaRepository<GroupInvite, Long> {

    List<GroupInvite> findByInviteeIdAndStatus(Long inviteeId, GroupInviteStatus status);

    List<GroupInvite> findByGroupIdAndStatus(Long groupId, GroupInviteStatus status);

    List<GroupInvite> findByStatusAndExpiresAtBefore(GroupInviteStatus status, Timestamp now);

    boolean existsByGroupIdAndInviteeIdAndStatus(Long groupId, Long inviteeId, GroupInviteStatus status);
}
