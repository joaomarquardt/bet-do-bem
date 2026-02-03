package com.api.betdobem.mappers;

import com.api.betdobem.domain.Activity;
import com.api.betdobem.dtos.requests.CreateActivityRequest;
import com.api.betdobem.dtos.requests.UpdateActivityRequest;
import com.api.betdobem.dtos.responses.ActivityResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ActivityMapper {
    ActivityMapper INSTANCE = Mappers.getMapper(ActivityMapper.class);

    Activity toActivityEntity(CreateActivityRequest request);

    ActivityResponse toActivityResponse(Activity activity);

    List<ActivityResponse> toActivityResponseList(List<Activity> activities);

    @Mapping(target = "id", ignore = true)
    void updateActivityRequest(UpdateActivityRequest request, @MappingTarget Activity activity);
}
