package com.api.betdobem.mappers;

import com.api.betdobem.domain.Bet;
import com.api.betdobem.dtos.requests.BetRequest;
import com.api.betdobem.dtos.responses.BetResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BetMapper {
    BetMapper INSTANCE = Mappers.getMapper(BetMapper.class);

    Bet toBetEntity(BetRequest request);

    BetResponse toBetResponse(Bet bet);

    List<BetResponse> toBetResponseList(List<Bet> bets);

    @Mapping(target = "id", ignore = true)
    void updateBetRequest(BetRequest request, @MappingTarget Bet bet);
}
