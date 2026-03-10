package com.api.betdobem.mappers;

import com.api.betdobem.domain.Proof;
import com.api.betdobem.dtos.requests.CreateProofRequest;
import com.api.betdobem.dtos.requests.UpdateProofRequest;
import com.api.betdobem.dtos.responses.ProofResponse;
import com.api.betdobem.services.S3StorageService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class ProofMapper {
    @Autowired
    private S3StorageService s3StorageService;

    public abstract Proof toProofEntity(CreateProofRequest request);

    @Mapping(source = "author.id", target = "authorId")
    @Mapping(source = "imageUrl", target = "imageUrl", qualifiedByName = "generateS3Url")
    public abstract ProofResponse toProofResponse(Proof proof);

    @Mapping(source = "author.id", target = "authorId")
    public abstract List<ProofResponse> toProofResponseList(List<Proof> proofs);

    @Mapping(target = "id", ignore = true)
    public abstract void updateProofRequest(UpdateProofRequest request, @MappingTarget Proof proof);

    @Named("generateS3Url")
    protected String generateS3Url(String imagePath) {
        if (imagePath == null || imagePath.trim().isEmpty()) {
            return null;
        }
        if (imagePath.startsWith("http")) {
            return imagePath;
        }
        return s3StorageService.generatePresignedDownloadUrl(imagePath);
    }
}
