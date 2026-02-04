package com.api.betdobem.mappers;

import com.api.betdobem.domain.Bet;
import com.api.betdobem.dtos.requests.CreateBetRequest;
import com.api.betdobem.dtos.requests.UpdateBetRequest;
import com.api.betdobem.dtos.responses.BetResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ProofMapper.class})
public interface BetMapper {
    BetMapper INSTANCE = Mappers.getMapper(BetMapper.class);

    Bet toBetEntity(CreateBetRequest request);

    @Mapping(source = "creator.id", target = "creatorId")
    @Mapping(source = "opponent.id", target = "opponentId")
    @Mapping(source = "proofs", target = "proofs")
    BetResponse toBetResponse(Bet bet);

    @Mapping(source = "creator.id", target = "creatorId")
    @Mapping(source = "opponent.id", target = "opponentId")
    List<BetResponse> toBetResponseList(List<Bet> bets);

    @Mapping(target = "id", ignore = true)
    void updateBetRequest(UpdateBetRequest request, @MappingTarget Bet bet);
}
