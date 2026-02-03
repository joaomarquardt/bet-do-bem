package com.api.betdobem.mappers;

import com.api.betdobem.domain.Vote;
import com.api.betdobem.dtos.requests.VoteRequest;
import com.api.betdobem.dtos.responses.VoteResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface VoteMapper {
    VoteMapper INSTANCE = Mappers.getMapper(VoteMapper.class);

    Vote toVoteEntity(VoteRequest request);

    VoteResponse toVoteResponse(Vote vote);

    List<VoteResponse> toVoteResponseList(List<Vote> votes);

    @Mapping(target = "id", ignore = true)
    void updateVoteRequest(VoteRequest request, @MappingTarget Vote vote);
}
