package com.api.betdobem.mappers;

import com.api.betdobem.domain.Challenge;
import com.api.betdobem.dtos.requests.CreateChallengeRequest;
import com.api.betdobem.dtos.requests.UpdateChallengeRequest;
import com.api.betdobem.dtos.responses.ChallengeResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ProofMapper.class})
public interface ChallengeMapper {
    ChallengeMapper INSTANCE = Mappers.getMapper(ChallengeMapper.class);

    Challenge toChallengeEntity(CreateChallengeRequest request);

    @Mapping(source = "proof", target = "proof")
    ChallengeResponse toChallengeResponse(Challenge challenge);

    @Mapping(source = "proof", target = "proof")
    List<ChallengeResponse> toChallengeResponseList(List<Challenge> challenges);

    @Mapping(target = "id", ignore = true)
    void updateChallengeRequest(UpdateChallengeRequest request, @MappingTarget Challenge challenge);
}
