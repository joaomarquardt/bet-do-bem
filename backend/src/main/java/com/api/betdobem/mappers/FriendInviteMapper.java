package com.api.betdobem.mappers;

import com.api.betdobem.domain.FriendInvite;
import com.api.betdobem.dtos.responses.FriendInviteResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface FriendInviteMapper {
    FriendInviteMapper INSTANCE = Mappers.getMapper(FriendInviteMapper.class);

    FriendInviteResponse toFriendInviteResponse(FriendInvite friendInvite);

    List<FriendInviteResponse> toFriendInviteResponseList(List<FriendInvite> friendInvites);
}
