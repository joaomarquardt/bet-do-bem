package com.api.betdobem.mappers;

import com.api.betdobem.domain.Challenge;
import com.api.betdobem.dtos.requests.ChallengeRequest;
import com.api.betdobem.dtos.responses.ChallengeResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ChallengeMapper {
    ChallengeMapper INSTANCE = Mappers.getMapper(ChallengeMapper.class);

    Challenge toChallengeEntity(ChallengeRequest request);

    ChallengeResponse toChallengeResponse(Challenge challenge);

    List<ChallengeResponse> toChallengeResponseList(List<Challenge> challenges);

    @Mapping(target = "id", ignore = true)
    void updateChallengeRequest(ChallengeRequest request, @MappingTarget Challenge challenge);
}
