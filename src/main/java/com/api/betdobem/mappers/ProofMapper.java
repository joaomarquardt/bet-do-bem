package com.api.betdobem.mappers;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.UpdateProofRequest;
import com.api.betdobem.dtos.responses.ProofResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProofMapper {
    ProofMapper INSTANCE = Mappers.getMapper(ProofMapper.class);

    Proof toProofEntity(CreateProofRequest request);

    ProofResponse toProofResponse(Proof proof);

    List<ProofResponse> toProofResponseList(List<Proof> proofs);

    @Mapping(target = "id", ignore = true)
    void updateProofRequest(UpdateProofRequest request, @MappingTarget Proof proof);
}
