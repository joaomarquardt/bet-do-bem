package com.api.betdobem.mappers;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.UpdateProofRequest;
import com.api.betdobem.dtos.responses.ProofResponse;
import com.api.betdobem.services.S3StorageService;
import jdk.jfr.Name;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class ProofMapper {
    @Value("${aws.cloudfront.domain.name}")
    private String cloudFrontDomainName;

    public abstract Proof toProofEntity(CreateProofRequest request);

    @Mapping(source = "author.id", target = "authorId")
    @Mapping(source = "imageUrl", target = "imageUrl", qualifiedByName = "imagePathToCdnUrl")
    public abstract ProofResponse toProofResponse(Proof proof);

    @Mapping(source = "author.id", target = "authorId")
    public abstract List<ProofResponse> toProofResponseList(List<Proof> proofs);

    @Mapping(target = "id", ignore = true)
    public abstract void updateProofRequest(UpdateProofRequest request, @MappingTarget Proof proof);

    @Named("imagePathToCdnUrl")
    protected String imagePathToCdnUrl(String imagePath) {
        if (imagePath == null || imagePath.trim().isEmpty()) {
            return null;
        }
        return "https://" + cloudFrontDomainName + "/" + imagePath;
    }
}
